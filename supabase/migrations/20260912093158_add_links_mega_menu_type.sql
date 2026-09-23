
alter table menu_items drop constraint menu_items_menu_type_check;
alter table menu_items add constraint menu_items_menu_type_check
  check (menu_type = any (array['simple', 'colleges_mega', 'campus_mega', 'placement_mega', 'links_mega']));
