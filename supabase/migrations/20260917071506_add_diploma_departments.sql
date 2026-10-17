insert into departments (college_id, name, slug, code, status) values
  ('dde273e6-8922-4793-bea2-18d158713f37', 'Information Technology-Dip', 'it-dip', 'ITDIP', 'published'),
  ('dde273e6-8922-4793-bea2-18d158713f37', 'Electrical Engineering-Dip', 'elect-dip', 'ELECDIP', 'published'),
  ('dde273e6-8922-4793-bea2-18d158713f37', 'Mechanical Engineering-Dip', 'mech-dip', 'MECHDIP', 'published'),
  ('dde273e6-8922-4793-bea2-18d158713f37', 'Civil Engineering-Dip', 'civil-dip', 'CIVILDIP', 'published'),
  ('dde273e6-8922-4793-bea2-18d158713f37', 'Applied Science & Humanities-Dip', 'ash-dip', 'ASHDIP', 'published')
returning id, name, slug;
