# 18 — Academics menu, enquiry form removed, accreditation rename

No migration. Menu changes are live data; the code changes need a deploy.

## Enquiry form removed
- `/admissions/inquiry` and `InquiryForm.tsx` are deleted, and the page is out of the sitemap.
- The old URL redirects to `/admissions` (`next.config.ts`), because saved homepage buttons, the
  popup and printed links still use it.
- Code links now go to `/admissions`: course and college pages, Scholarships, Parents, `CTABanner`
  and `HeroNew` defaults, and the popup defaults.
- The **Start Application** button is gone from `/admissions`.
- The Inquiries Inbox in admin keeps past enquiries but gets no new website ones.
- Still mentioning the form, editable in admin: the homepage hero and promo buttons, the
  "Admissions 2026-27" quick link, and step 1 on `/admissions`.

## Main menu (`menu_items`, live)
- **Admissions** is renamed **Academics**. Its links are now a plain list without group headings:
  Admissions, Programmes, Central Library, Intake & Fees, Scholarships, Downloads.
- **Enquire / Apply Now** and **Student Login** are soft-deleted. `/student-login` still works.
- Academics has the quote "From admission to graduation, every programme is built on
  AICTE-approved standards."
- The About SVIT quote is now "Inspired by the Iron Man of India, shaping technocrats since 1997."
- About SVIT's "Accreditation & Compliance" item is now **AICTE & Accreditation**.

## Code
- `LinksMegaPanel`: a menu with no group headings flows into two columns.
- `CampusMegaPanel`: Central Library is no longer its own Campus Life category, as it moved to
  Academics. This needs a deploy, so the live site lists it in both menus until then.
- `/about/accreditation`: heading, page title and search entry renamed.
- `/admissions` and programme pages show "—" when Eligibility is empty.

## Other files
- `course-content-suggestions.md` (repo root): general text for each programme. The site doesn't
  read this file.

## Programme content (`courses`, live)
- Description, Eligibility, Highlights and Outcomes of all 12 programmes were replaced with the text
  from that file. Rows marked Confirm there still need checking against GTU, ACPC or council rules.

## Verify
1. `/admissions/inquiry` redirects to `/admissions`.
2. Desktop: the Academics menu shows two columns and the quote.
3. Campus Life menu has no separate Central Library category; its page still loads.
