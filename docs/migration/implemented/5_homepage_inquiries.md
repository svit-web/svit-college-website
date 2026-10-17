# Implemented: Homepage Layout & Inquiry Suites (Phase 4 Completed)

We have successfully designed and built the remaining custom wizards of **Phase 4: Custom Wizards & Complex Panels**.

---

## 🎨 1. Interactive Homepage Layout Builder
* **File Location**: `src/routes/admin.homepage.tsx`
* **URL Route**: `/admin/homepage`
* **Features**:
  * Unifies the layout, structural widgets, and carousel promos into a single dynamic panel.
  * **Layout Sections Tab**:
    * Lists all active database sections (`homepage_sections`) ordered by sorting index.
    * **Arrangement Engine**: Shift buttons to move rows up or down to dynamically rearrange sections.
    * Custom modal configuration specifying section type templates (statistic numbers, hero, grids, slider carousels) and direct configuration JSONB formatting.
  * **Widgets & Blocks Tab**:
    * Coordinates custom sidebar widget plugins (`homepage_widgets`) by assigning them directly to parent sections.
    * Form inputs to configure widget templates (RSS feeds, HTML content, notice blocks).
  * **Banners & Items Tab**:
    * Wraps the generic `AdminCrudManager` for `homepage_items` to manage sliders, banners, and links.

---

## 📬 2. Inquiry Submission Suite
* **File Location**: `src/routes/admin.inquiries.tsx`
* **URL Route**: `/admin/inquiries`
* **Features**:
  * **Submissions Inbox Tab**:
    * Queries incoming forms data from visitors (`inquiry_submissions`) dynamically.
    * Extracts JSONB submitted keys (e.g. name, department choice, message) and maps them dynamically as data table headers on-the-fly. No static properties required.
  * **CSV Data Exporter**:
    * A client-side exporter that compiles all submissions for the selected template into a structured CSV worksheet.
    * Triggers a browser download immediately matching form-name slug configurations.
  * **Configure Template Fields Tab**:
    * Form schema template designer letting managers customize input properties, validations, and field configurations directly inside `fields_config` (JSONB) lists. Handles target email arrays.
