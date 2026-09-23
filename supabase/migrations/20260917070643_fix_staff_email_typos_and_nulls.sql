-- Fix obvious domain typos in original legacy data
update staff_profiles set email = 'dhruveshmathur.ash@svitvasad.ac.in' where id = 'df48b315-73fa-4773-9d56-35b62fb19fbf';
update staff_profiles set email = 'mihirthakkar.ash@svitvasad.ac.in' where id = '05d389c2-adbd-4004-8900-ea201cab10ba';

-- Null garbage/placeholder test emails that aren't real
update staff_profiles set email = NULL where id = '255529d3-0fc1-4e79-bd40-d9dc53512da3'; -- ashish@svit.com (Sandip Patel, unrelated placeholder)
update staff_profiles set email = NULL where id = '683ca66d-6b01-4de7-a68b-67c245492a44'; -- abc@gmail.com
update staff_profiles set email = NULL where id = 'ab6ada05-ff41-4480-bb95-700c91d48610'; -- as@gm.com1, test-looking row

-- Null "needs-review" placeholder emails from the original import (auto-generated stand-ins, not real addresses).
-- All of these turned out to be duplicate profiles of people who already have their real email elsewhere in the table.
update staff_profiles set email = NULL where id in (
  '26abf132-4462-44df-8078-72ebb1954ed0',
  'ea47f111-7419-4f91-9bb7-3dc443bd680e',
  '19c213ce-b0d8-4439-8a6e-6db5049a6751',
  '20837c8f-07b1-4518-9ed9-cda128bc2ded',
  '62320596-2876-4d21-8ef2-2dc2e08135fd',
  '201861c8-d2e6-40bc-a947-3382b528f45e',
  '18f63f23-6bd8-4b50-8fd8-20543e5ec703',
  'e2dfcf03-f3fd-4bb0-97b8-f83836d0210f',
  '4dd8f7fd-5949-4bd1-9e6d-35e35e0b2de1',
  '6189eb8c-1e1f-4b00-b1f0-99ae8021d8f8',
  '9601d0b2-dd62-4820-9d78-3c25d1531c71',
  '62839e38-c819-4601-a9e0-9176b4505c9b',
  '5965ad87-8d80-4606-adbc-bfce8936d1aa',
  '224e3063-f7fb-4dd4-8d20-ada841f36003',
  '6fb3352d-df0b-441b-ac07-c7ba3afa590a',
  '3e34a340-cacd-444f-b495-0c3e911d1da8',
  '17971388-cba1-4996-bf82-5e2aecf25e9b',
  'c0ebafa0-95e0-4650-9b54-a3757eb7be7c',
  'b3c3d81d-116d-4c52-909f-d395c65b70c9',
  '3fa9f4a8-9aeb-44bf-89a4-042c0e883856',
  '9f121cfd-61ac-4551-af6f-07fcb4a30cc6',
  '5bec20d3-d570-46cd-8caf-093e0f9ca55d',
  'ea56f171-39d3-430a-a608-1b261f060fd7',
  'cb519ad8-d542-4bb1-9ad5-0570945c686b',
  '1526f09a-3c66-4d67-a59e-6935c5291809',
  'ef6f1e88-4a34-41f6-a7a0-64dd712b2947',
  '91ca002d-f88c-42d7-96e8-ab4febb6af72',
  'a78a8677-725f-4531-b566-6777be08e00a',
  '321f46e0-fddb-40ec-bdb9-ecfa15b7e0ef',
  'e76b2cef-10ac-408f-a080-bab896e9ef98',
  'f3a31dfa-7ed5-4c16-9026-9bfd90b9f082',
  'a7331f75-012c-4f3e-8df1-430fdb6328bf',
  'e6c4e072-7106-4658-8132-67f42cfe7fcb',
  '954dc075-484f-4377-b728-9709381bbd5d',
  '73509793-0a89-4e05-bc20-56ac99ae19dd',
  'f842e99d-24d2-423a-b31e-72906e230a89',
  'b553fc9d-4b83-4ddf-9e3e-0f65c09d101c',
  'ae532fe0-a291-40f5-b259-fb6773de72f3',
  '26394215-f927-4e6e-aa12-8f5bdcfe1cd1',
  'd93802ce-25bd-4ffe-bd28-9ad7925ba454'
);
