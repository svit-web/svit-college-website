-- Corrects 20261004090320's email auto-link. 8 of 29 links pointed at the
-- wrong person because the committee data used role/shared mailboxes
-- (hod.civil@, hod.mech@, hodit.svit@, contact@) or another staff member's
-- address. Audited by comparing member name vs linked staff name; these
-- members become External (free text) until an admin links them by hand.
update public.committee_members
set staff_profile_id = null
where id in (
  '4d8b2458-644f-4613-a000-8cfefb6908fa', -- Dr N M Trivedi    -> was Devesh P Soni (hod.civil@)
  'bca13890-898c-4c98-a27b-3ae86e3d1105', -- Dr. N. M. Trivedi -> was Devesh P Soni (hod.civil@)
  '4e1a3947-2e95-4dfe-8526-8c543cbd16cf', -- Mala Mehta (HOD-IT) -> was Bijal Jigar Talati (hodit.svit@)
  '69d07b04-f240-44ae-8c2e-8d6166a7b623', -- Mr. Neel Gosai    -> was "Amisha Staff"
  '470805fa-45bc-4545-b602-e8b7c2949ee5', -- Prof. Neel Gosai  -> was "Amisha Staff"
  '6f735cd0-63f9-498b-8cc9-e91c41f90a75', -- Dr. Pratik Shah   -> was Dipen S Shah (hod.mech@)
  'b9a48bdd-28eb-4df1-a552-52125f29b562', -- Mr. Gaurangbhai Patel -> was Pratik C Patel (contact@)
  '82088e3b-ff3e-4367-851e-ff67981c7470'  -- Prof. MAla Mehta  -> was Rahul Mehta (his email, her name)
);
