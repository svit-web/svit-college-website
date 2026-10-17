-- Re-point diploma courses from the generic "Diploma Studies" bucket to their real dedicated diploma departments
update courses set department_id = 'f8f54527-cf12-4cd9-9819-1a8521306da2' where id = '9fe7312c-6976-473e-8443-4ac79e5b2e91'; -- DIP-ME -> mech-dip
update courses set department_id = 'ec21b6f9-a8a6-4567-a225-7714e75521c9' where id = '3893a1f8-0783-44cf-927e-6cb8aaf1a066'; -- DIP-IT -> it-dip
update courses set department_id = '7485095d-3cc8-4fdc-88b6-6fc620ed2762' where id = 'd31ccbde-f8e4-4afb-8919-c39ae30ce303'; -- DIP-CE -> com-dip
update courses set department_id = 'eed41f4e-db1c-41c0-af32-8001c6974fb6' where id = '0f34407e-25f1-43be-9e90-a8db6f0ec6db'; -- DIP-EE -> elect-dip
update courses set department_id = '83c27b8a-8db6-44eb-89cc-b781c9c62f40' where id = 'bcde5b0e-1132-420c-bd09-93580f0d68f5'; -- DIP-CIV -> civil-dip

-- Confirm nothing else references it, then remove the generic department
delete from departments where id = '2668eccb-d6b2-459d-ac78-b5e260edaf03' and slug = 'diploma-studies';
