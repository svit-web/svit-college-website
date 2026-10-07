# Self-hosted Supabase — operations guide

A second Supabase instance, self-hosted on the college's own server, runs alongside
the hosted platform project. This doc is written so a Claude Code session can follow
it directly with its own tools (Bash/SSH, Edit, git) — every step is a literal
command, not a description of one.

**Read this before touching the self-hosted instance for any reason**: applying a
migration, debugging a self-hosted-only bug, resyncing from the platform, or
rotating a credential.

## Topology

| | |
|---|---|
| Server | `user0` (SSH host alias — passwordless key auth already configured) |
| Stack location | `~/deploy/supabase/docker/` on `user0` |
| Stack | Official `supabase/docker` compose bundle, pinned to release `v1.26.08`, trimmed project name `svit_supabase` (set via `COMPOSE_PROJECT_NAME` in `.env` — avoids colliding with an unrelated pre-existing `supabase_default` Docker network on that box; never touch that network) |
| Public URL | `https://supabase.svit.qzz.io` (temporary domain; may change — check `~/deploy/supabase/docker/.env`'s `SUPABASE_PUBLIC_URL`/`API_EXTERNAL_URL` for the current value before assuming) |
| Postgres / Supavisor pooler | **loopback-only** (`127.0.0.1:5432` / `127.0.0.1:6543` on `user0`) — deliberate, never re-expose these publicly |
| DB container | `supabase-db` (Postgres, confusingly the actual DB container name even though the compose service is `db`) |
| Tunnel/ingress | Cloudflare Tunnel, already running as a long-lived process on `user0` (`cloudflared tunnel run --token ...`); not a systemd service, so a `user0` reboot kills it — if the public URL stops responding, check `ps aux | grep cloudflared` on `user0` first |
| Studio (dashboard) login | `DASHBOARD_USERNAME`/`DASHBOARD_PASSWORD` in `~/deploy/supabase/docker/.env` on `user0` |
| MCP endpoint | `https://supamcp.svit.qzz.io/mcp` (Cloudflare Tunnel hostname, path-scoped to `/mcp`), backed by Kong's `/mcp` route → studio's `/api/mcp`. Auth = `x-mcp-key` header checked by Kong (`key-auth` + `acl` on the route, consumer `mcp-client`); the key is `MCP_API_KEY` in `.env` on `user0` and `SVIT_MCP_KEY` in `.claude/settings.local.json` (gitignored). Without the header Kong returns 401. |

The hosted platform project ref lives in `.mcp.json` at the repo root (currently
`agezrfclusigfqysbxwb`) — that's the Supabase MCP tool's target, a completely
separate project from self-hosted. Don't confuse the two.

## Connecting

```bash
ssh user0                              # passwordless, key already set up
docker exec -u postgres supabase-db psql -U postgres -d postgres   # psql inside the DB container
docker logs supabase-<service> --tail 50 --since 10m               # e.g. supabase-auth, supabase-storage, supabase-rest
```

From your own machine (Postgres is loopback-only on `user0` by design — go through
SSH, don't re-expose the port):

```bash
ssh -N -L 5432:127.0.0.1:5432 user0 &    # one-off tunnel; `kill %1` when done
psql "postgresql://postgres.svit-vasad:<POSTGRES_PASSWORD>@127.0.0.1:5432/postgres"
```

`POOLER_TENANT_ID` is `svit-vasad` — Supavisor requires the tenant-qualified
username (`postgres.<tenant>`), a bare `postgres` user fails with "no tenant
identifier provided". `POSTGRES_PASSWORD` is in `.env` on `user0`.

## Applying a new migration (the normal case)

Same migration file you'd write for the hosted platform, applied the same way you'd
apply any `supabase/migrations/*.sql` file — just targeted at self-hosted instead of
(or in addition to) the hosted project.

```bash
# from your own machine, after writing supabase/migrations/<ts>_your_migration.sql
scp supabase/migrations/<ts>_your_migration.sql user0:/tmp/migration.sql
ssh user0 '
  docker cp /tmp/migration.sql supabase-db:/tmp/migration.sql
  docker exec -u postgres supabase-db psql -1 -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/migration.sql
'
```

`-1` wraps the whole file in one transaction — a failure rolls back cleanly instead
of leaving a half-applied migration. `-v ON_ERROR_STOP=1` makes any error abort
immediately rather than continuing past it. **Always use both** unless you have a
specific reason not to (see the roles.sql exception during a full resync, below).

After any migration that touches `public.*` schema (new table, new column, RLS
change), restart PostgREST and Storage so they drop their cached schema:

```bash
ssh user0 'cd ~/deploy/supabase/docker && docker compose restart rest storage'
```

Verify the change actually landed before considering it done — e.g. for an RLS
change:

```bash
ssh user0 "docker exec supabase-db psql -U postgres -d postgres -t -c \"select polname, pg_get_expr(polwithcheck, polrelid) from pg_policy where polrelid='your_table'::regclass;\""
```

**The Supabase CLI also works against self-hosted**, via `--db-url` instead of
`--linked`/`--project-ref` (those are hosted-platform-only, Management-API-backed
flags):

```bash
supabase db push --db-url "postgresql://postgres.svit-vasad:<PASSWORD>@127.0.0.1:5432/postgres"
supabase db diff --db-url "postgresql://postgres.svit-vasad:<PASSWORD>@127.0.0.1:5432/postgres"
```

CLI is pre-installed on `user0` at `~/.local/bin/supabase` (v2.119.0 at setup time).

## Known fragile points — check these after ANY full resync from hosted

A **full resync** (wiping self-hosted's `public`/`auth`/`storage` data and reloading
fresh from a `supabase db dump` of the hosted platform) is sometimes needed when the
platform's schema or data has changed significantly. Two things live outside the
`public`-schema dump and get silently lost whenever `public` is dropped/recreated,
or were never in the dump to begin with — **always check both after a resync**:

### 1. The `auth.users` trigger

`public.handle_new_user()` (the function) survives a `public` schema reload fine,
but the `CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users ...` that
calls it lives in the `auth` schema — `DROP SCHEMA public CASCADE` takes it down
with it, and it is never recreated because a plain `public`-only dump doesn't
include it. Symptom: new users can authenticate (GoTrue succeeds) but have no
`user_profiles`/`user_roles` row, failing role checks silently.

```bash
ssh user0 "docker exec supabase-db psql -U postgres -d postgres -t -c \"select tgname from pg_trigger where tgrelid='auth.users'::regclass and not tgisinternal;\""
# if on_auth_user_created is missing:
ssh user0 "docker exec -u postgres supabase-db psql -U postgres -d postgres -c \"CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();\""
```

### 2. `storage.objects` RLS policies

The 8 bucket-read/write policies (public read + authenticated insert/update/delete,
scoped per bucket for `media` and `staff-photos`) live in the `storage` schema —
same blind spot. Symptom: every upload 403s with "new row violates row-level
security policy" even for a global admin.

```bash
ssh user0 "docker exec supabase-db psql -U postgres -d postgres -t -c \"select count(*) from pg_policy where polrelid='storage.objects'::regclass;\""
# should be 8 (confirm exact policy text by reading them from the hosted platform via
# the Supabase MCP tool's execute_sql, then recreate verbatim with CREATE POLICY)
```

### 3. Schema-version drift vs the hosted platform

The hosted platform's Auth/Storage services are ahead of whatever self-hosted
release is pinned (`v1.26.08` at setup time — check for a newer `self-hosted/v*`
tag before assuming this is still current). A straight `supabase db dump` from
hosted will reference tables/columns self-hosted doesn't have yet:
`mfa_recovery_code_sets`, `mfa_recovery_codes`, `scim_tokens`, `scim_users`,
`one_time_tokens`, `custom_oauth_providers` (auth schema); `versioning_status`,
`lifecycle_configuration*` on `storage.buckets`; `archived_at`,
`is_delete_marker`, `is_versioned` on `storage.objects`;
`storage.buckets_vectors`/`vector_indexes` (newer vector-storage feature, and
oddly `permission denied` rather than a missing-relation error even when they
nominally exist — just drop these COPY blocks rather than debugging it, they're
empty on hosted anyway).

**Before dropping any of these from a dump**, confirm they're actually empty on
hosted (via the Supabase MCP tool) — don't assume, verify count=0 first. If
something unexpectedly has data, that needs a real decision, not a silent drop.

### 4. `data.sql` from a plain `supabase db dump` includes auth + storage too

`supabase db dump --data-only --use-copy` with no `--schema` flag dumps
`public`+`auth`+`storage` combined, not just `public`. If you're also dumping
`auth`/`storage` separately (`--schema auth`, `--schema storage`), strip `data.sql`
down to `public`-only first or you'll get duplicate-key errors restoring storage/auth
twice.

## Full resync procedure (platform → self-hosted)

Only do this when told to, and only treat self-hosted as safe to overwrite
— it is, as long as nothing has been edited independently on self-hosted since the
last sync (check with whoever asked). Full command sequence:

```bash
# 1. Dump from hosted (needs a Supabase personal access token with FULL scopes —
#    a scope-restricted token fails with "Missing required permission(s): database_write")
ssh user0 'cd ~/deploy/supabase/migration && export SUPABASE_ACCESS_TOKEN=<token> && \
  ~/.local/bin/supabase link --project-ref <hosted-project-ref> && \
  ~/.local/bin/supabase db dump -f roles.sql --role-only && \
  ~/.local/bin/supabase db dump -f schema.sql && \
  ~/.local/bin/supabase db dump -f data.sql --data-only --use-copy && \
  ~/.local/bin/supabase db dump -f auth.sql --data-only --use-copy --schema auth && \
  ~/.local/bin/supabase db dump -f storage.sql --data-only --use-copy --schema storage'

# 2. Patch the dumps — strip data.sql to public-only, strip the version-mismatched
#    columns/tables from storage.sql and auth.sql (see "Known fragile points" #3/#4
#    above for the exact list; verify against current hosted schema each time, it
#    may have changed since this doc was written)

# 3. Wipe self-hosted's current state
ssh user0 'docker exec -u postgres supabase-db psql -1 -v ON_ERROR_STOP=1 -U postgres -d postgres -c "
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO postgres;
  GRANT ALL ON SCHEMA public TO public;
  TRUNCATE auth.users CASCADE;
  TRUNCATE auth.flow_state CASCADE;  -- not FK-linked to auth.users, needs its own truncate
  TRUNCATE storage.buckets CASCADE;
"'

# 4. Reload in order: roles (non-transactional, old-role-already-exists errors are
#    expected and harmless on a 2nd+ resync — roles are cluster-wide and survive the
#    wipe above) → schema → storage → data → auth (last three with
#    `SET session_replication_role = replica;` first, to defer FK/trigger checks for
#    self-referencing tables like menu_items/media_folders)
ssh user0 '
  docker cp roles.sql schema.sql storage.sql data.sql auth.sql supabase-db:/tmp/
  docker exec -u postgres supabase-db psql -v ON_ERROR_STOP=0 -U postgres -d postgres -f /tmp/roles.sql
  docker exec -u postgres supabase-db psql -1 -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/schema.sql
  docker exec -u postgres supabase-db psql -1 -v ON_ERROR_STOP=1 -U postgres -d postgres -c "SET session_replication_role = replica;" -f /tmp/storage.sql
  docker exec -u postgres supabase-db psql -1 -v ON_ERROR_STOP=1 -U postgres -d postgres -c "SET session_replication_role = replica;" -f /tmp/data.sql
  docker exec -u postgres supabase-db psql -1 -v ON_ERROR_STOP=1 -U postgres -d postgres -c "SET session_replication_role = replica;" -f /tmp/auth.sql
'

# 5. Fix the two things step 3's DROP SCHEMA always breaks — see "Known fragile
#    points" #1 and #2 above, do both, every time.

# 6. Refresh caches
ssh user0 'cd ~/deploy/supabase/docker && docker compose restart rest storage'

# 7. Verify row counts match hosted (spot-check a handful of tables via the
#    Supabase MCP tool vs the same query over SSH+psql on self-hosted)
```

If storage **file bytes** (not just metadata rows) also need syncing — only
necessary if actual uploads changed, check by diffing the `storage.objects`
bucket/path list before and after — download from hosted's public URL
(`https://<hosted-ref>.supabase.co/storage/v1/object/public/<bucket>/<path>`, works
unauthenticated for public buckets) and upload to self-hosted
(`POST http://127.0.0.1:8000/storage/v1/object/<bucket>/<path>` with
`Authorization: Bearer <self-hosted service_role key>`, `x-upsert: true`).

## Local dev against self-hosted

`.env.selfhosted` at the repo root holds the self-hosted instance's
`NEXT_PUBLIC_SUPABASE_URL`/keys (gitignored — contains the service-role key).
`npm run dev:selfhosted` / `pnpm dev:selfhosted` loads it via `dotenv-cli`,
overriding the platform values in the base `.env`. Plain `npm run dev` still uses
the hosted platform. See the `dev:selfhosted` script in `package.json` and
`dotenv-cli`'s invocation there if this needs to change.

## What the MCP tooling can and can't see

Two MCP servers in `.mcp.json`:

- `supabase` — the **hosted platform project** (Management API backed).
- `supabase-selfhosted` — the **self-hosted instance**, via `https://supamcp.svit.qzz.io/mcp`
  with the `x-mcp-key` header (value from `SVIT_MCP_KEY` in `.claude/settings.local.json`,
  which also holds it on the server as `MCP_API_KEY` in `~/deploy/supabase/docker/.env`).
  Its `execute_sql` runs against the self-hosted DB — same power as the `docker exec psql`
  path above, so the usual caution applies.

How the self-hosted MCP was enabled (2026-10-08): Kong's `mcp` service in
`volumes/api/kong.yml` (blocked by default with `request-termination`) was switched to
`ip-restriction` (loopback + docker bridge gateway `172.24.0.1`) + `key-auth`
(`x-mcp-key`) + `acl` (consumer `mcp-client`, group `mcp`). Kong only listens on
`127.0.0.1:8000`, so the only network path is the Cloudflare tunnel hostname
`supamcp.svit.qzz.io` (path `/mcp`) — configured in the Cloudflare Zero Trust dashboard,
not on the server (the tunnel is token-based). No Cloudflare Access policy is in front;
the Kong key IS the authentication. To rotate the key: change `MCP_API_KEY` in `.env`,
`docker compose up -d kong --force-recreate`, and update `SVIT_MCP_KEY` locally.
Pre-change backup of `kong.yml` lives on `user0` next to the live file
(`kong.yml.bak-20261008`).
