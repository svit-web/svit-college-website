insert into staff_department_assignments (staff_id, department_id, designation_id, is_primary, status) values
  -- DIPLOMA IN CIVIL
  ('7ee8b2ef-54ff-4c9c-b122-4f84c0f35912', '83c27b8a-8db6-44eb-89cc-b781c9c62f40', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published'),
  ('e0056985-31df-4093-9917-44c49169043d', '83c27b8a-8db6-44eb-89cc-b781c9c62f40', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published'),
  -- DIPLOMA IN COMPUTER
  ('4125efc4-14b4-4ece-beb6-791b186c778a', '7485095d-3cc8-4fdc-88b6-6fc620ed2762', 'a4fa047d-2510-4816-8ea7-4daa9d1794dc', true, 'published'),
  ('759b0909-af3f-46cb-85de-ddbdf4c4277d', '7485095d-3cc8-4fdc-88b6-6fc620ed2762', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published'),
  ('e62b89ea-95f5-442c-b0f1-3edf7ef866df', '7485095d-3cc8-4fdc-88b6-6fc620ed2762', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published'),
  ('4c0d1420-6009-4b9c-982c-5b533a0d3497', '7485095d-3cc8-4fdc-88b6-6fc620ed2762', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published'),
  -- DIPLOMA IN ELECTRICAL
  ('61af0c67-ef1f-4720-82c5-1d870c3f4193', 'eed41f4e-db1c-41c0-af32-8001c6974fb6', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published'),
  ('07677fe8-6881-44ad-8f7f-0c3fd505c16c', 'eed41f4e-db1c-41c0-af32-8001c6974fb6', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published'),
  ('0a894f43-3bb4-48c8-8498-6b271cf9c502', 'eed41f4e-db1c-41c0-af32-8001c6974fb6', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published'),
  -- DIPLOMA IN IT
  ('031f7bde-363e-47d9-9033-de633e86b510', 'ec21b6f9-a8a6-4567-a225-7714e75521c9', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published'),
  ('298e3a54-4928-4535-890e-8986e827a4d6', 'ec21b6f9-a8a6-4567-a225-7714e75521c9', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published'),
  ('78da2db8-842e-4431-8a53-860ce41a6ab8', 'ec21b6f9-a8a6-4567-a225-7714e75521c9', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published'),
  -- DIPLOMA IN MECHANICAL
  ('74d2b36f-f024-4a71-b0ab-4120dc2bb4cd', 'f8f54527-cf12-4cd9-9819-1a8521306da2', 'a4fa047d-2510-4816-8ea7-4daa9d1794dc', true, 'published'),
  ('c0a87faf-2593-461b-b0a9-d55851c3f648', 'f8f54527-cf12-4cd9-9819-1a8521306da2', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published'),
  ('ba3bf602-8ecc-4b10-98d4-a59215b52cc8', 'f8f54527-cf12-4cd9-9819-1a8521306da2', 'a4fa047d-2510-4816-8ea7-4daa9d1794dc', true, 'published'),
  ('62c82314-608c-4fdb-b5a8-8fcc86047b83', 'f8f54527-cf12-4cd9-9819-1a8521306da2', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published'),
  ('9ef934f0-51e3-40a3-9e5d-23c5b4683580', 'f8f54527-cf12-4cd9-9819-1a8521306da2', 'a8991350-f958-4e04-aa54-4ce6eaa9c434', true, 'published');

-- Re-point the 6 Diploma ASH staff added earlier from the generic "Diploma Studies" bucket to the new dedicated ash-dip department
update staff_department_assignments set department_id = '20f3fac9-f132-4ba7-8842-24add8ba29d6'
where department_id = '2668eccb-d6b2-459d-ac78-b5e260edaf03'
and staff_id in ('13616bf8-315b-438b-af33-938cc7b8e2cb','e4e52584-0ac3-4b98-b936-93c0d84497c8','5de4b3f6-9707-44c1-885c-92c55af70bc8','c18e3709-700a-49b3-a99a-e5c75e991b37','543625dc-0228-4267-b726-7a6400cc27ee','69a883d1-f76a-4815-b8d1-4c8088c62b4c');
