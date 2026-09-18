#!/usr/bin/env python3
"""
Generate Supabase seed files for all faculty from Excel data
- Only includes Working employees (excludes Resigned)
- Uses employee codes as external identifiers
- Generates separate seed files by college for maintainability
"""

import zipfile
import xml.etree.ElementTree as ET
import json
import re
from pathlib import Path
from collections import defaultdict

# Department mapping from Excel to database slugs
DEPT_MAPPING = {
    'AERONAUTICAL ENGINEERING': {
        'slug': 'dept-svit-be-aeronautical',
        'college': 'svit',
        'type': 'BE'
    },
    'CIVIL ENGINEERING': {
        'slug': 'dept-svit-be-civil',
        'college': 'svit',
        'type': 'BE'
    },
    'ELECTRICAL ENGINEERING': {
        'slug': 'dept-svit-be-electrical',
        'college': 'svit',
        'type': 'BE'
    },
    'COMPUTER ENGINEERING': {
        'slug': 'dept-svit-be-computer',
        'college': 'svit',
        'type': 'BE'
    },
    'INFORMATION TECHNOLOGY': {
        'slug': 'dept-svit-be-it',
        'college': 'svit',
        'type': 'BE'
    },
    'ELECTRONIC AND COMMUNICATION': {
        'slug': 'dept-svit-be-ec',
        'college': 'svit',
        'type': 'BE'
    },
    'INSTRUMENTATION AND CONTROL': {
        'slug': 'dept-svit-be-ic',
        'college': 'svit',
        'type': 'BE'
    },
    'APPLIED SCIENCES AND HUMANITIES': {
        'slug': 'dept-svit-be-ash',
        'college': 'svit',
        'type': 'BE'
    },
    'MECHANICAL ENGINEERING': {
        'slug': 'dept-svit-be-mechanical',
        'college': 'svit',
        'type': 'BE'
    },
    'COMPUTER SCIENCE AND DESIGN': {
        'slug': 'dept-svit-be-csd',
        'college': 'svit',
        'type': 'BE'
    },
    'MASTER OF BUSINESS ADMINISTR...': {
        'slug': 'dept-svit-mba',
        'college': 'svit',
        'type': 'MBA'
    },
    'MASTER OF COMPUTER APPLICATION': {
        'slug': 'dept-svit-mca',
        'college': 'svit',
        'type': 'MCA'
    },
    'DIPLOMA IN COMPUTER': {
        'slug': 'dept-svit-dip-computer',
        'college': 'svit',
        'type': 'Diploma'
    },
    'DIPLOMA IN ELECTRICAL': {
        'slug': 'dept-svit-dip-electrical',
        'college': 'svit',
        'type': 'Diploma'
    },
    'DIPLOMA IN MECHANICAL': {
        'slug': 'dept-svit-dip-mechanical',
        'college': 'svit',
        'type': 'Diploma'
    },
    'DIPLOMA IN CIVIL': {
        'slug': 'dept-svit-dip-civil',
        'college': 'svit',
        'type': 'Diploma'
    },
    'DIPLOMA IN INFORMATION TECHN...': {
        'slug': 'dept-svit-dip-it',
        'college': 'svit',
        'type': 'Diploma'
    },
    'DIPLOMA APPLIED SCIENCE &amp...': {
        'slug': 'dept-svit-dip-ash',
        'college': 'svit',
        'type': 'Diploma'
    },
    'BACHELOR OF ARCHITECTURE': {
        'slug': 'dept-coa-arch',
        'college': 'svit-coa',
        'type': 'Architecture'
    },
    'BACHELOR OF SCIENCE IN NURSING': {
        'slug': 'dept-svion-gn',
        'college': 'svion',
        'type': 'Nursing'
    },
    'BACHELOR OF COMPUTER APPLICA...': {
        'slug': 'dept-svica-ca',
        'college': 'svica',
        'type': 'BCA'
    },
}

def parse_name(full_name):
    """Parse full name into title, first name, last name"""
    # Remove extra spaces
    full_name = ' '.join(full_name.split())
    
    # Extract title
    title = ''
    name_parts = full_name.split()
    
    if name_parts[0].upper() in ['MR.', 'MRS.', 'MS.', 'DR.', 'PROF.']:
        title = name_parts[0].replace('.', '').title() + '.'
        name_parts = name_parts[1:]
    
    # Default title if not present
    if not title:
        title = 'Mr.'
    
    # Last word is usually last name
    if len(name_parts) >= 2:
        first_name = ' '.join(name_parts[:-1])
        last_name = name_parts[-1]
    elif len(name_parts) == 1:
        first_name = name_parts[0]
        last_name = ''
    else:
        first_name = 'Unknown'
        last_name = ''
    
    # Capitalize properly
    first_name = first_name.title()
    last_name = last_name.title()
    
    return title, first_name, last_name

def generate_email(first_name, last_name, dept_info):
    """Generate email address"""
    # Clean names
    first = re.sub(r'[^a-z]', '', first_name.lower())
    last = re.sub(r'[^a-z]', '', last_name.lower())
    
    # Get suffix based on college
    suffix_map = {
        'svit': 'svitvasad.ac.in',
        'svit-coa': 'svitvasad.ac.in',
        'svica': 'svitvasad.ac.in',
        'svion': 'svitvasad.ac.in',
    }
    
    suffix = suffix_map.get(dept_info['college'], 'svitvasad.ac.in')
    
    return f"{first}{last}@{suffix}"

def escape_sql_string(s):
    """Escape single quotes for SQL"""
    if s is None:
        return ''
    return s.replace("'", "''")

def read_excel_staff(xlsx_path):
    """Read all working staff from Excel file"""
    all_staff = {}
    
    with zipfile.ZipFile(xlsx_path, 'r') as zip_ref:
        # Get sheet names
        with zip_ref.open('xl/workbook.xml') as f:
            tree = ET.parse(f)
            root = tree.getroot()
            ns = {'': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            
            sheets = {}
            for sheet in root.findall('.//sheet', ns):
                name = sheet.get('name')
                sheet_id = int(sheet.get('sheetId'))
                sheets[sheet_id] = name
        
        # Read each academic department
        for sheet_id, dept_name in sheets.items():
            if dept_name not in DEPT_MAPPING:
                continue
                
            try:
                with zip_ref.open(f'xl/worksheets/sheet{sheet_id}.xml') as f:
                    tree = ET.parse(f)
                    root = tree.getroot()
                    ns = {'': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                    
                    rows = []
                    for row in root.findall('.//row', ns):
                        row_data = []
                        for cell in row.findall('.//c', ns):
                            value = cell.find('.//v', ns)
                            if value is not None and value.text:
                                row_data.append(value.text)
                            else:
                                inline = cell.find('.//is/t', ns)
                                if inline is not None and inline.text:
                                    row_data.append(inline.text)
                                else:
                                    row_data.append('')
                        if row_data:
                            rows.append(row_data)
                    
                    # Collect ONLY Working staff
                    staff_list = []
                    for row in rows[1:]:
                        if len(row) >= 7 and row[6] == 'Working':
                            title, first_name, last_name = parse_name(row[1])
                            dept_info = DEPT_MAPPING[dept_name]
                            email = generate_email(first_name, last_name, dept_info)
                            
                            staff = {
                                'code': row[0],
                                'name': row[1],
                                'title': title,
                                'first_name': first_name,
                                'last_name': last_name,
                                'email': email,
                                'designation': row[4],
                                'gender': row[5],
                                'dept_slug': dept_info['slug'],
                                'dept_type': dept_info['type'],
                                'college': dept_info['college'],
                            }
                            staff_list.append(staff)
                    
                    if staff_list:
                        all_staff[dept_name] = staff_list
            except Exception as e:
                print(f"Error reading {dept_name}: {e}")
    
    return all_staff

def generate_sql_for_staff(staff_list, dept_slug, dept_name):
    """Generate SQL INSERT statements for staff in a department"""
    sql_lines = []
    sql_lines.append(f"  -- ============================================")
    sql_lines.append(f"  -- {dept_name} ({len(staff_list)} staff)")
    sql_lines.append(f"  -- ============================================")
    sql_lines.append("")
    
    for staff in staff_list:
        # Staff profile
        sql_lines.append(f"  -- {staff['name']} - {staff['designation']}")
        sql_lines.append(f"  INSERT INTO staff_profiles (first_name, last_name, email, title, metadata, status)")
        sql_lines.append(f"  VALUES (")
        sql_lines.append(f"    '{escape_sql_string(staff['first_name'])}',")
        sql_lines.append(f"    '{escape_sql_string(staff['last_name'])}',")
        sql_lines.append(f"    '{escape_sql_string(staff['email'])}',")
        sql_lines.append(f"    '{escape_sql_string(staff['title'])}',")
        sql_lines.append(f"    jsonb_build_object(")
        sql_lines.append(f"      'employee_code', '{escape_sql_string(staff['code'])}',")
        sql_lines.append(f"      'gender', '{escape_sql_string(staff['gender'])}',")
        sql_lines.append(f"      'department', '{escape_sql_string(dept_name)}',")
        sql_lines.append(f"      'full_name', '{escape_sql_string(staff['name'])}'")
        sql_lines.append(f"    ),")
        sql_lines.append(f"    'published'")
        sql_lines.append(f"  )")
        sql_lines.append(f"  ON CONFLICT (email) DO UPDATE SET")
        sql_lines.append(f"    first_name = EXCLUDED.first_name,")
        sql_lines.append(f"    last_name = EXCLUDED.last_name,")
        sql_lines.append(f"    title = EXCLUDED.title,")
        sql_lines.append(f"    metadata = EXCLUDED.metadata,")
        sql_lines.append(f"    status = EXCLUDED.status,")
        sql_lines.append(f"    updated_at = now()")
        sql_lines.append(f"  RETURNING id INTO v_staff_id;")
        sql_lines.append("")
        
        # Department assignment
        sql_lines.append(f"  INSERT INTO staff_department_assignments (")
        sql_lines.append(f"    staff_id, department_id, designation_id, designation_override, is_primary, status, metadata")
        sql_lines.append(f"  )")
        sql_lines.append(f"  VALUES (")
        sql_lines.append(f"    v_staff_id,")
        sql_lines.append(f"    v_dept_{dept_slug.replace('-', '_').replace('dept_', '')},")
        sql_lines.append(f"    gen_random_uuid(),")
        sql_lines.append(f"    '{escape_sql_string(staff['designation'])}',")
        sql_lines.append(f"    true,")
        sql_lines.append(f"    'published',")
        sql_lines.append(f"    jsonb_build_object('employee_code', '{escape_sql_string(staff['code'])}')")
        sql_lines.append(f"  )")
        sql_lines.append(f"  ON CONFLICT DO NOTHING;")
        sql_lines.append("")
    
    return '\n'.join(sql_lines)

def generate_seed_file_by_college(all_staff, college_name, output_dir):
    """Generate a seed file for all departments in a college"""
    # Filter departments by college
    college_depts = {}
    for dept_name, staff_list in all_staff.items():
        if staff_list and staff_list[0]['college'] == college_name:
            college_depts[dept_name] = staff_list
    
    if not college_depts:
        return
    
    # Count total staff
    total_staff = sum(len(staff_list) for staff_list in college_depts.values())
    
    # Generate department variable declarations
    dept_vars = []
    dept_selects = []
    for dept_name in sorted(college_depts.keys()):
        dept_slug = DEPT_MAPPING[dept_name]['slug']
        var_name = f"v_dept_{dept_slug.replace('-', '_').replace('dept_', '')}"
        dept_vars.append(f"  {var_name} uuid;")
        dept_selects.append(f"  SELECT id INTO {var_name} FROM departments WHERE slug = '{dept_slug}';")
    
    # Build SQL file
    sql = []
    sql.append(f"-- Seed {college_name.upper()} faculty and staff")
    sql.append(f"-- Generated from: Employee_List_by_Department.xlsx")
    sql.append(f"-- Date: 2026-09-17")
    sql.append(f"-- Total staff: {total_staff} across {len(college_depts)} departments")
    sql.append(f"-- Status: Working only (Resigned employees excluded)")
    sql.append("")
    sql.append("DO $$")
    sql.append("DECLARE")
    sql.extend(dept_vars)
    sql.append("  v_staff_id uuid;")
    sql.append("BEGIN")
    sql.append("  -- Get department IDs")
    sql.extend(dept_selects)
    sql.append("")
    
    # Add staff for each department
    for dept_name in sorted(college_depts.keys()):
        sql.append(generate_sql_for_staff(
            college_depts[dept_name],
            DEPT_MAPPING[dept_name]['slug'],
            dept_name
        ))
    
    sql.append(f"  RAISE NOTICE 'Successfully seeded {total_staff} {college_name.upper()} faculty members across {len(college_depts)} departments';")
    sql.append("")
    sql.append("END $$;")
    
    # Write file
    output_file = output_dir / f"09_faculty_{college_name}.sql"
    output_file.write_text('\n'.join(sql))
    print(f"Created: {output_file} ({total_staff} staff)")

def main():
    xlsx_path = '/Users/porus/Downloads/Employee_List_by_Department.xlsx'
    output_dir = Path('/Users/porus/code/svit-college-website/supabase/seeds')
    
    print("Reading Excel file...")
    all_staff = read_excel_staff(xlsx_path)
    
    print(f"\nFound {sum(len(s) for s in all_staff.values())} working staff across {len(all_staff)} departments")
    
    # Group by college
    colleges = set(DEPT_MAPPING[dept]['college'] for dept in all_staff.keys())
    
    print(f"\nGenerating seed files for {len(colleges)} colleges...")
    for college in sorted(colleges):
        generate_seed_file_by_college(all_staff, college, output_dir)
    
    print("\n✓ All faculty seed files generated!")

if __name__ == '__main__':
    main()
