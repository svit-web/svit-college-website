# SVIT Admin Portal Test Accounts

This document contains credentials for the seeded test users used to verify Role-Based Access Control (RBAC) in the SVIT College Website Admin Portal.

## 🔑 Login Credentials

All accounts use the same password:
* **Password**: `Password123!`

| Email | Account Owner | Role | Scope Level | Target Scope Entity |
| :--- | :--- | :---: | :---: | :--- |
| **`admin.global@svit.ac.in`** | Global Admin | `admin` | **`global`** | Complete portal access (Global) |
| **`editor.trust@svit.ac.in`** | Trust Editor | `editor` | **`trust`** | Mahapatra Education Trust |
| **`editor.svit@svit.ac.in`** | SVIT College Editor | `editor` | **`college`** | SVIT Engineering College |
| **`editor.svica@svit.ac.in`** | SVICA College Editor | `editor` | **`college`** | SVICA Computer Applications |
| **`editor.comp@svit.ac.in`** | Computer Dept Editor | `editor` | **`department`** | Computer Engineering Department |
| **`editor.it@svit.ac.in`** | IT Dept Editor | `editor` | **`department`** | Information Technology Department |

---

## 🛠 Seeding Reference
The database has been seeded using the SQL script:
[`supabase/seed_test_users.sql`](file:///C:/Users/Asus/Downloads/New%20svit%20website/svit-college-website/supabase/seed_test_users.sql)

To re-run the seed or clear the users, execute the SQL script in your Supabase SQL editor.
    