import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldAlert, Users as UsersIcon, Plus, X, KeyRound, Pencil, Trash2, Loader2 } from "lucide-react";
import { useAdminAuthContext } from "@/contexts/AdminAuthContext";
import {
  listPortalUsers,
  listScopeOptions,
  createPortalUser,
  assignPortalUserRole,
  removePortalUserRole,
  updatePortalUserProfile,
  adminSetUserPassword,
  type PortalUser,
  type ScopeOption,
} from "@/lib/user-management.functions";

export const Route = createFileRoute("/admin/user-management")({
  component: UserManagementPage,
});

interface ScopeOptions {
  trusts: ScopeOption[];
  colleges: ScopeOption[];
  departments: ScopeOption[];
  roles: { code: string; name: string }[];
}

function scopeEntityLabel(scopeType: string) {
  if (scopeType === "trust") return "Trust";
  if (scopeType === "college") return "College";
  if (scopeType === "department") return "Department";
  return null;
}

function ScopeFields({
  options,
  roleCode,
  setRoleCode,
  scopeType,
  setScopeType,
  scopeId,
  setScopeId,
}: {
  options: ScopeOptions;
  roleCode: string;
  setRoleCode: (v: string) => void;
  scopeType: string;
  setScopeType: (v: string) => void;
  scopeId: string;
  setScopeId: (v: string) => void;
}) {
  const entityLabel = scopeEntityLabel(scopeType);
  const entityOptions =
    scopeType === "trust" ? options.trusts : scopeType === "college" ? options.colleges : scopeType === "department" ? options.departments : [];

  // "Administrator" is unconditionally global-access in this app (see
  // useUserScope.ts) regardless of what scope it's paired with — offering it
  // alongside a Trust/College/Department scope reads like "the admin of this
  // department" but actually grants full site access. Only show it at Global.
  const roleOptions = scopeType === "global" ? options.roles : options.roles.filter((r) => r.code !== "admin");

  return (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Access Scope</label>
        <select
          value={scopeType}
          onChange={(e) => {
            const nextScope = e.target.value;
            setScopeType(nextScope);
            setScopeId("");
            if (nextScope !== "global" && roleCode === "admin") setRoleCode("");
          }}
          className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-crimson/30"
        >
          <option value="global">Global (entire website)</option>
          <option value="trust">Trust</option>
          <option value="college">College</option>
          <option value="department">Department</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Role</label>
        <select
          value={roleCode}
          onChange={(e) => setRoleCode(e.target.value)}
          className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-crimson/30"
        >
          <option value="">Select a role…</option>
          {roleOptions.map((r) => (
            <option key={r.code} value={r.code}>
              {r.name}
            </option>
          ))}
        </select>
        {scopeType !== "global" && (
          <p className="text-[11px] text-slate-500">Administrator is only available at Global scope.</p>
        )}
      </div>

      {entityLabel && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">{entityLabel}</label>
          <select
            value={scopeId}
            onChange={(e) => setScopeId(e.target.value)}
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-crimson/30"
          >
            <option value="">Select {entityLabel.toLowerCase()}…</option>
            {entityOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}

function UserManagementPage() {
  const { roles, loading: authLoading } = useAdminAuthContext();
  const isAdmin = roles.some((r) => r.code === "admin");

  const [users, setUsers] = useState<PortalUser[]>([]);
  const [scopeOptions, setScopeOptions] = useState<ScopeOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editProfileUser, setEditProfileUser] = useState<PortalUser | null>(null);
  const [rolesUser, setRolesUser] = useState<PortalUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<PortalUser | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [userList, options] = await Promise.all([listPortalUsers(), listScopeOptions()]);
      setUsers(userList);
      setScopeOptions(options as ScopeOptions);
    } catch (err: any) {
      toast.error(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  if (!authLoading && !isAdmin) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-600">
          <ShieldAlert className="h-4 w-4" />
          Global Admin access required
        </p>
        <p className="mt-1 text-sm text-slate-500">You don't have permission to manage portal users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl flex items-center gap-3">
            <UsersIcon className="h-8 w-8 text-crimson" />
            User Management
          </h1>
          <p className="text-sm text-slate-500">Create portal accounts, assign access, and reset passwords. Global Admin only.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-crimson px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson/90 transition"
        >
          <Plus className="h-4 w-4" />
          Create User
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users…
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Access</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-slate-900 font-medium">
                    {u.firstName || u.lastName ? `${u.firstName} ${u.lastName}`.trim() : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {u.roles.length === 0 && <span className="text-xs text-slate-400">No access assigned</span>}
                      {u.roles.map((r) => (
                        <span
                          key={r.userRoleId}
                          className="inline-flex items-center rounded bg-slate-50 px-2 py-1 text-xs font-semibold text-crimson border border-slate-200"
                        >
                          {r.roleName} · {r.scopeLabel}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Edit profile"
                        onClick={() => setEditProfileUser(u)}
                        className="rounded p-1.5 text-slate-500 hover:text-navy hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        title="Manage roles"
                        onClick={() => setRolesUser(u)}
                        className="rounded p-1.5 text-slate-500 hover:text-navy hover:bg-slate-100"
                      >
                        <ShieldAlert className="h-4 w-4" />
                      </button>
                      <button
                        title="Reset password"
                        onClick={() => setPasswordUser(u)}
                        className="rounded p-1.5 text-slate-500 hover:text-navy hover:bg-slate-100"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {createOpen && scopeOptions && (
        <CreateUserModal
          options={scopeOptions}
          saving={saving}
          setSaving={setSaving}
          onClose={() => setCreateOpen(false)}
          onCreated={async () => {
            setCreateOpen(false);
            await refresh();
          }}
        />
      )}

      {editProfileUser && (
        <EditProfileModal
          user={editProfileUser}
          saving={saving}
          setSaving={setSaving}
          onClose={() => setEditProfileUser(null)}
          onSaved={async () => {
            setEditProfileUser(null);
            await refresh();
          }}
        />
      )}

      {rolesUser && scopeOptions && (
        <ManageRolesModal
          user={rolesUser}
          options={scopeOptions}
          saving={saving}
          setSaving={setSaving}
          onClose={() => setRolesUser(null)}
          onChanged={refresh}
        />
      )}

      {passwordUser && (
        <ResetPasswordModal
          user={passwordUser}
          saving={saving}
          setSaving={setSaving}
          onClose={() => setPasswordUser(null)}
        />
      )}
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/80 p-4 z-50 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-black/30">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-navy">
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-display text-xl font-bold text-navy mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function CreateUserModal({
  options,
  saving,
  setSaving,
  onClose,
  onCreated,
}: {
  options: ScopeOptions;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roleCode, setRoleCode] = useState("");
  const [scopeType, setScopeType] = useState("global");
  const [scopeId, setScopeId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scopeType !== "global" && !scopeId) {
      toast.error(`Select a ${scopeEntityLabel(scopeType)?.toLowerCase()}.`);
      return;
    }
    setSaving(true);
    try {
      await createPortalUser({
        data: {
          email,
          password,
          firstName,
          lastName,
          roleCode,
          scopeType,
          trustId: scopeType === "trust" ? scopeId : null,
          collegeId: scopeType === "college" ? scopeId : null,
          departmentId: scopeType === "department" ? scopeId : null,
        },
      });
      toast.success(`Created account for ${email}`);
      onCreated();
    } catch (err: any) {
      toast.error(`Failed to create user: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Create User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">First Name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-crimson/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Last Name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-crimson/30"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-crimson/30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Temporary Password</label>
          <input
            type="text"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-crimson/30"
          />
        </div>

        <ScopeFields
          options={options}
          roleCode={roleCode}
          setRoleCode={setRoleCode}
          scopeType={scopeType}
          setScopeType={setScopeType}
          scopeId={scopeId}
          setScopeId={setScopeId}
        />

        <button
          type="submit"
          disabled={saving || !roleCode}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-crimson px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson/90 transition disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Create User
        </button>
      </form>
    </ModalShell>
  );
}

function EditProfileModal({
  user,
  saving,
  setSaving,
  onClose,
  onSaved,
}: {
  user: PortalUser;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePortalUserProfile({ data: { userId: user.id, firstName, lastName } });
      toast.success("Profile updated.");
      onSaved();
    } catch (err: any) {
      toast.error(`Failed to update profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`Edit Profile — ${user.email}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">First Name</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-crimson/30"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Last Name</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-crimson/30"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-crimson px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson/90 transition disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </button>
      </form>
    </ModalShell>
  );
}

function ManageRolesModal({
  user,
  options,
  saving,
  setSaving,
  onClose,
  onChanged,
}: {
  user: PortalUser;
  options: ScopeOptions;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [currentRoles, setCurrentRoles] = useState(user.roles);
  const [roleCode, setRoleCode] = useState("");
  const [scopeType, setScopeType] = useState("global");
  const [scopeId, setScopeId] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleCode) {
      toast.error("Select a role.");
      return;
    }
    if (scopeType !== "global" && !scopeId) {
      toast.error(`Select a ${scopeEntityLabel(scopeType)?.toLowerCase()}.`);
      return;
    }
    setSaving(true);
    try {
      await assignPortalUserRole({
        data: {
          userId: user.id,
          roleCode,
          scopeType,
          trustId: scopeType === "trust" ? scopeId : null,
          collegeId: scopeType === "college" ? scopeId : null,
          departmentId: scopeType === "department" ? scopeId : null,
        },
      });
      toast.success("Access granted.");
      await onChanged();
      onClose();
    } catch (err: any) {
      toast.error(`Failed to assign role: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (userRoleId: string) => {
    if (!window.confirm("Remove this access from the user?")) return;
    setSaving(true);
    try {
      await removePortalUserRole({ data: userRoleId });
      setCurrentRoles((prev) => prev.filter((r) => r.userRoleId !== userRoleId));
      toast.success("Access removed.");
      await onChanged();
    } catch (err: any) {
      toast.error(`Failed to remove access: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`Manage Access — ${user.email}`} onClose={onClose}>
      <div className="space-y-2 mb-5">
        {currentRoles.length === 0 && <p className="text-sm text-slate-400">No access assigned yet.</p>}
        {currentRoles.map((r) => (
          <div
            key={r.userRoleId}
            className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <span className="text-sm font-semibold text-navy">
              {r.roleName} <span className="text-slate-500 font-normal">· {r.scopeLabel}</span>
            </span>
            <button
              onClick={() => handleRemove(r.userRoleId)}
              disabled={saving}
              className="text-slate-500 hover:text-crimson disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="space-y-4 border-t border-slate-200 pt-4">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Grant New Access</p>
        <ScopeFields
          options={options}
          roleCode={roleCode}
          setRoleCode={setRoleCode}
          scopeType={scopeType}
          setScopeType={setScopeType}
          scopeId={scopeId}
          setScopeId={setScopeId}
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-crimson px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson/90 transition disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Grant Access
        </button>
      </form>
    </ModalShell>
  );
}

function ResetPasswordModal({
  user,
  saving,
  setSaving,
  onClose,
}: {
  user: PortalUser;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onClose: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSetUserPassword({ data: { userId: user.id, newPassword } });
      toast.success(`Password reset for ${user.email}. Share the new password with them securely.`);
      onClose();
    } catch (err: any) {
      toast.error(`Failed to reset password: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`Reset Password — ${user.email}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">New Password</label>
          <input
            type="text"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-crimson/30"
          />
          <p className="text-xs text-slate-500">This immediately replaces their current password. Share it with them securely.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-crimson px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson/90 transition disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Reset Password
        </button>
      </form>
    </ModalShell>
  );
}
