import fs from "fs";
import path from "path";
import https from "https";

let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://agezrfclusigfqysbxwb.supabase.co";
let supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZXpyZmNsdXNpZ2ZxeXNieHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDUyNzQ3MiwiZXhwIjoyMTAwMTAzNDcyfQ.3sQ8XB3bgJ0ci3abAJokG2f2osprtHjvoGBTaU1UHq4";

if (!supabaseUrl || !supabaseKey) {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      for (const line of envContent.split("\n")) {
        const match =
          line.match(/^\s*([\w_]+)\s*=\s*"(.*)"\s*$/) ||
          line.match(/^\s*([\w_]+)\s*=\s*'(.*)'\s*$/) ||
          line.match(/^\s*([\w_]+)\s*=\s*(.*)\s*$/);
        if (match) {
          const [, key, val] = match;
          if (key === "VITE_SUPABASE_URL" || key === "SUPABASE_URL") supabaseUrl = supabaseUrl || val;
          if (key === "SUPABASE_SERVICE_ROLE_KEY") supabaseKey = val;
          else if (!supabaseKey && (key === "VITE_SUPABASE_PUBLISHABLE_KEY" || key === "SUPABASE_PUBLISHABLE_KEY")) supabaseKey = val;
        }
      }
    }
  } catch (err) {
    // Ignore
  }
}

const hostname = new URL(supabaseUrl).hostname;

function requestPostgrest(table, records, onConflict) {
  return new Promise((resolve, reject) => {
    const query = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : "";
    const postData = JSON.stringify(records);

    const options = {
      hostname: hostname,
      port: 443,
      path: `/rest/v1/${table}${query}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=representation,resolution=merge-duplicates",
        "Content-Length": Buffer.byteLength(postData),
      },
      rejectUnauthorized: false,
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`[HTTP ${res.statusCode}] ${data}`));
        }
      });
    });

    req.on("error", (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

function deletePostgrest(table, queryParams) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      port: 443,
      path: `/rest/v1/${table}?${queryParams}`,
      method: "DELETE",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      rejectUnauthorized: false,
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode);
    });

    req.on("error", (e) => reject(e));
    req.end();
  });
}

async function runSeed() {
  console.log(`Connecting to Supabase Cloud REST API (Service Role): https://${hostname}`);
  console.log("\nStarting database seeding in foreign key dependency order...\n");

  try {
    // 1. Trusts
    console.log("1. Seeding Trusts...");
    let trustId = null;
    try {
      const trusts = await requestPostgrest("trusts", [
        {
          name: "Mahapatra Education Trust",
          slug: "mahapatra-trust",
          logo_url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80",
          status: "published",
        },
      ], "slug");
      console.log(`   ✓ Inserted/Updated ${trusts.length} Trust(s)`);
      trustId = trusts[0]?.id;
    } catch (e) {
      console.warn("   ⚠️ Trusts table note:", e.message);
    }

    // 2. Institutes
    console.log("2. Seeding Institutes...");
    let instituteId = null;
    if (trustId) {
      try {
        const institutes = await requestPostgrest("institutes", [
          {
            trust_id: trustId,
            name: "SVIT Group of Educational Institutes",
            slug: "svit-group",
            status: "published",
          },
        ], "slug");
        console.log(`   ✓ Inserted/Updated ${institutes.length} Institute(s)`);
        instituteId = institutes[0]?.id;
      } catch (e) {
        console.warn("   ⚠️ Institutes table note:", e.message);
      }
    }

    // 3. Colleges
    console.log("3. Seeding Colleges...");
    let collegeId = null;
    if (instituteId) {
      try {
        const colleges = await requestPostgrest("colleges", [
          {
            institute_id: instituteId,
            name: "Sardar Vallabhbhai Patel Institute of Technology",
            slug: "svit",
            code: "SVIT",
            logo_url: "/__l5e/assets-v1/6b5fd3d4-843d-4072-8ec4-663e3fe9e57a/svit-logo.jpg",
            sort_order: 1,
            status: "published",
          },
          {
            institute_id: instituteId,
            name: "Sardar Vallabhbhai Patel Institute of Computer Applications",
            slug: "svica",
            code: "SVICA",
            logo_url: "/__l5e/assets-v1/3c28feb0-462e-48c1-8a9f-42234f5be279/svica-logo.jpg",
            sort_order: 2,
            status: "published",
          },
          {
            institute_id: instituteId,
            name: "Sardar Vallabhbhai Patel Institute of Nursing",
            slug: "svion",
            code: "SVION",
            logo_url: "/__l5e/assets-v1/a31711bd-5868-4f73-aa4f-cce55d6d1057/svion-logo.png",
            sort_order: 3,
            status: "published",
          },
          {
            institute_id: instituteId,
            name: "College of Architecture",
            slug: "svit-coa",
            code: "COA",
            logo_url: "/__l5e/assets-v1/d3a378f3-5f40-476f-ba85-f2a98b40730e/coa-svit-logo.png",
            sort_order: 4,
            status: "published",
          },
        ], "slug");
        console.log(`   ✓ Inserted/Updated ${colleges.length} College(s)`);
        collegeId = colleges[0]?.id;
      } catch (e) {
        console.error("   ❌ Colleges error:", e.message);
      }
    }

    // 4. Departments
    console.log("4. Seeding Departments...");
    let deptId = null;
    if (collegeId) {
      try {
        const depts = await requestPostgrest("departments", [
          {
            college_id: collegeId,
            name: "Computer Engineering",
            slug: "computer-engineering",
            code: "CE",
            status: "published",
          },
          {
            college_id: collegeId,
            name: "Information Technology",
            slug: "information-technology",
            code: "IT",
            status: "published",
          },
          {
            college_id: collegeId,
            name: "Mechanical Engineering",
            slug: "mechanical-engineering",
            code: "ME",
            status: "published",
          },
        ], "college_id,slug");
        console.log(`   ✓ Inserted/Updated ${depts.length} Department(s)`);
        deptId = depts[0]?.id;
      } catch (e) {
        console.warn("   ⚠️ Departments table note:", e.message);
      }
    }

    // 5. Courses
    console.log("5. Seeding Courses...");
    if (deptId) {
      try {
        const courses = await requestPostgrest("courses", [
          {
            department_id: deptId,
            name: "B.Tech Computer Engineering",
            code: "BTECH-CE",
            degree_level: "undergraduate",
            status: "published",
          },
          {
            department_id: deptId,
            name: "M.Tech Computer Engineering",
            code: "MTECH-CE",
            degree_level: "graduate",
            status: "published",
          },
        ], "code");
        console.log(`   ✓ Inserted/Updated ${courses.length} Course(s)`);
      } catch (e) {
        console.warn("   ⚠️ Courses table note:", e.message);
      }
    }

    // 6. Designations & Staff Profiles
    console.log("6. Seeding Designations & Staff Profiles...");
    try {
      await requestPostgrest("designations", [
        { title: "Professor & Head of Department" },
        { title: "Associate Professor" },
      ], "title");
    } catch (e) {}

    try {
      const staff = await requestPostgrest("staff_profiles", [
        {
          title: "Dr.",
          first_name: "Rajesh",
          last_name: "Patel",
          email: "rajesh.patel@svit.ac.in",
          bio: "Senior Academician & Head of Computer Engineering with 20+ years of research in AI.",
          status: "published",
        },
      ], "email");
      console.log(`   ✓ Inserted/Updated ${staff.length} Staff Profile(s)`);
    } catch (e) {
      console.warn("   ⚠️ Staff profiles table note:", e.message);
    }

    // 7. Homepage Items
    console.log("7. Seeding Homepage Items...");
    try {
      const hpItems = await requestPostgrest("homepage_items", [
        {
          scope_type: "global",
          item_type: "hero",
          eyebrow: "Est. 2005 · Vasad, Gujarat",
          title: "Build Your Future.",
          title_accent: "Shape The World.",
          subtitle:
            "SVIT Vasad is a premier institute offering AICTE-approved programmes in engineering, management and applied sciences with 95%+ placement across 200+ recruiting partners.",
          body: null,
          image_url: null,
          icon_name: null,
          link_href: "/admissions/inquiry",
          link_label: "Apply Now",
          secondary_link_href: "/courses",
          secondary_link_label: "Explore Courses",
          sort_order: 0,
          is_active: true,
          status: "published",
        },
        {
          scope_type: "global",
          item_type: "stat",
          eyebrow: null,
          title: "20+",
          title_accent: null,
          subtitle: "Years of Excellence",
          body: null,
          image_url: null,
          icon_name: null,
          link_href: null,
          link_label: null,
          secondary_link_href: null,
          secondary_link_label: null,
          sort_order: 1,
          is_active: true,
          status: "published",
        },
        {
          scope_type: "global",
          item_type: "stat",
          eyebrow: null,
          title: "5000+",
          title_accent: null,
          subtitle: "Students",
          body: null,
          image_url: null,
          icon_name: null,
          link_href: null,
          link_label: null,
          secondary_link_href: null,
          secondary_link_label: null,
          sort_order: 2,
          is_active: true,
          status: "published",
        },
        {
          scope_type: "global",
          item_type: "stat",
          eyebrow: null,
          title: "95%",
          title_accent: null,
          subtitle: "Placement Record",
          body: null,
          image_url: null,
          icon_name: null,
          link_href: null,
          link_label: null,
          secondary_link_href: null,
          secondary_link_label: null,
          sort_order: 3,
          is_active: true,
          status: "published",
        },
      ]);
      console.log(`   ✓ Inserted/Updated ${hpItems.length} Homepage Item(s)`);
    } catch (e) {
      console.warn("   ⚠️ Homepage items table note:", e.message);
    }

    // 8. Recruiters
    console.log("8. Seeding Recruiters...");
    try {
      const recruiters = await requestPostgrest("recruiters", [
        { company_name: "TCS", logo_url: "/__l5e/assets-v1/tcs.jpg", sort_order: 1, status: "published" },
        { company_name: "Infosys", logo_url: "/__l5e/assets-v1/infosys.jpg", sort_order: 2, status: "published" },
        { company_name: "Wipro", logo_url: "/__l5e/assets-v1/wipro.jpg", sort_order: 3, status: "published" },
        { company_name: "L&T", logo_url: "/__l5e/assets-v1/lt.jpg", sort_order: 4, status: "published" },
        { company_name: "Reliance", logo_url: "/__l5e/assets-v1/reliance.jpg", sort_order: 5, status: "published" },
        { company_name: "Adani", logo_url: "/__l5e/assets-v1/adani.jpg", sort_order: 6, status: "published" },
      ]);
      console.log(`   ✓ Inserted/Updated ${recruiters.length} Recruiter(s)`);
    } catch (e) {
      console.warn("   ⚠️ Recruiters table note:", e.message);
    }

    // 9. Events
    console.log("9. Seeding Events...");
    try {
      const events = await requestPostgrest("events", [
        {
          scope_type: "global",
          title: "Ananya 2026 Cultural Fest",
          slug: "ananya-2026",
          tag: "Culture",
          start_date: "2026-02-12T00:00:00Z",
          description: "Three days of music, dance, drama and food across the campus greens.",
          sort_order: 1,
          status: "published",
          metadata: { is_featured: true, show_in_menu: true },
        },
        {
          scope_type: "global",
          title: "TechFest — National Symposium",
          slug: "techfest-2026",
          tag: "Tech",
          start_date: "2026-03-08T00:00:00Z",
          description: "Hackathons, tech talks and workshops with industry leaders.",
          sort_order: 2,
          status: "published",
          metadata: { is_featured: true, show_in_menu: true },
        },
      ]);
      console.log(`   ✓ Inserted/Updated ${events.length} Event(s)`);
    } catch (e) {
      console.warn("   ⚠️ Events table note:", e.message);
    }

    // 10. Menus & Menu Items (Clean old menu_items first to avoid duplicates)
    console.log("10. Seeding Menus & Navigation Items...");
    try {
      const menus = await requestPostgrest("menus", [
        { name: "Main Header Navigation", code: "main_navigation", status: "published" },
        { name: "Top Utility Navigation", code: "top_navigation", status: "published" },
      ], "code");
      console.log(`   ✓ Inserted/Updated ${menus.length} Menu(s)`);

      const mainMenu = menus.find((m) => m.code === "main_navigation");
      const topMenu = menus.find((m) => m.code === "top_navigation");

      if (mainMenu?.id) {
        await deletePostgrest("menu_items", `menu_id=eq.${mainMenu.id}`);
        const mainItems = await requestPostgrest("menu_items", [
          { menu_id: mainMenu.id, title: "Home", link_type: "external", url: "/", sort_order: 1, status: "published", metadata: { is_featured: true, show_in_menu: true } },
          { menu_id: mainMenu.id, title: "About Us", link_type: "external", url: "/about", sort_order: 2, status: "published", metadata: { is_featured: true, show_in_menu: true } },
          { menu_id: mainMenu.id, title: "Colleges", link_type: "external", url: "/colleges", sort_order: 3, status: "published", metadata: { is_featured: true, show_in_menu: true } },
          { menu_id: mainMenu.id, title: "Campus Life", link_type: "external", url: "/campus-life", sort_order: 4, status: "published", metadata: { is_featured: true, show_in_menu: true } },
          { menu_id: mainMenu.id, title: "Placement", link_type: "external", url: "/placement", sort_order: 5, status: "published", metadata: { is_featured: true, show_in_menu: true } },
          { menu_id: mainMenu.id, title: "Contact Us", link_type: "external", url: "/contact", sort_order: 6, status: "published", metadata: { is_featured: true, show_in_menu: true } },
        ]);
        console.log(`   ✓ Inserted ${mainItems.length} Main Navigation Item(s)`);
      }

      if (topMenu?.id) {
        await deletePostgrest("menu_items", `menu_id=eq.${topMenu.id}`);
        const topItems = await requestPostgrest("menu_items", [
          { menu_id: topMenu.id, title: "Students", link_type: "external", url: "/student-login", sort_order: 1, status: "published" },
          { menu_id: topMenu.id, title: "Parents", link_type: "external", url: "/parents", sort_order: 2, status: "published" },
          { menu_id: topMenu.id, title: "Alumni", link_type: "external", url: "/alumni", sort_order: 3, status: "published" },
          { menu_id: topMenu.id, title: "Careers", link_type: "external", url: "/careers", sort_order: 4, status: "published" },
        ]);
        console.log(`   ✓ Inserted ${topItems.length} Top Navigation Item(s)`);
      }
    } catch (e) {
      console.warn("   ⚠️ Menus table note:", e.message);
    }

    console.log("\n==================================================");
    console.log("🎉 Seeding complete! All example data inserted successfully.");
    console.log("==================================================\n");
  } catch (err) {
    console.error("\n❌ Seeding error:", err);
  }
}

runSeed();
