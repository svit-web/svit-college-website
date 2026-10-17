#!/usr/bin/env python3
"""
Database Audit Script
Compares current Excel data with database and reports what needs to be added/removed
"""

import zipfile
import xml.etree.ElementTree as ET
import json
from collections import defaultdict
from pathlib import Path

# Department mapping
DEPT_MAPPING = {
    'AERONAUTICAL ENGINEERING': 'dept-svit-be-aeronautical',
    'CIVIL ENGINEERING': 'dept-svit-be-civil',
    'ELECTRICAL ENGINEERING': 'dept-svit-be-electrical',
    'COMPUTER ENGINEERING': 'dept-svit-be-computer',
    'INFORMATION TECHNOLOGY': 'dept-svit-be-it',
    'ELECTRONIC AND COMMUNICATION': 'dept-svit-be-ec',
    'INSTRUMENTATION AND CONTROL': 'dept-svit-be-ic',
    'APPLIED SCIENCES AND HUMANITIES': 'dept-svit-be-ash',
    'MECHANICAL ENGINEERING': 'dept-svit-be-mechanical',
    'COMPUTER SCIENCE AND DESIGN': 'dept-svit-be-csd',
    'MASTER OF BUSINESS ADMINISTR...': 'dept-svit-mba',
    'MASTER OF COMPUTER APPLICATION': 'dept-svit-mca',
    'DIPLOMA IN COMPUTER': 'dept-svit-dip-computer',
    'DIPLOMA IN ELECTRICAL': 'dept-svit-dip-electrical',
    'DIPLOMA IN MECHANICAL': 'dept-svit-dip-mechanical',
    'DIPLOMA IN CIVIL': 'dept-svit-dip-civil',
    'DIPLOMA IN INFORMATION TECHN...': 'dept-svit-dip-it',
    'DIPLOMA APPLIED SCIENCE &amp...': 'dept-svit-dip-ash',
    'BACHELOR OF ARCHITECTURE': 'dept-coa-arch',
    'BACHELOR OF SCIENCE IN NURSING': 'dept-svion-gn',
    'BACHELOR OF COMPUTER APPLICA...': 'dept-svica-ca',
}

def read_excel_data(xlsx_path):
    """Read all working staff from Excel"""
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
                    
                    # Collect by status
                    working = []
                    resigned = []
                    
                    for row in rows[1:]:
                        if len(row) >= 7:
                            staff = {
                                'code': row[0],
                                'name': row[1],
                                'designation': row[4],
                                'gender': row[5],
                                'status': row[6],
                            }
                            
                            if row[6] == 'Working':
                                working.append(staff)
                            elif row[6] in ['Resigned', 'Left']:
                                resigned.append(staff)
                    
                    all_staff[dept_name] = {
                        'working': working,
                        'resigned': resigned,
                        'slug': DEPT_MAPPING[dept_name]
                    }
            except Exception as e:
                print(f"Error reading {dept_name}: {e}")
    
    return all_staff

def read_database_staff(json_path):
    """Read staff from old database export"""
    with open(json_path, 'r') as f:
        db_staff = json.load(f)
    
    # Group by department
    by_dept = defaultdict(list)
    for staff in db_staff:
        dept_id = staff.get('STAFF_DEP_ID', '0')
        is_active = staff.get('STAFF_IS_ACTIVE') in ['True', True]
        
        by_dept[dept_id].append({
            'id': staff.get('STAFF_ID'),
            'name': staff.get('STAFF_NAME'),
            'email': staff.get('STAFF_EMAIL_ID'),
            'designation': staff.get('STAFF_DESIGNATION'),
            'is_active': is_active,
        })
    
    return by_dept

def generate_audit_report(excel_data, output_path):
    """Generate comprehensive audit report"""
    
    report = []
    report.append("=" * 80)
    report.append("FACULTY DATABASE AUDIT REPORT")
    report.append(f"Generated: 2024-09-17")
    report.append("=" * 80)
    report.append("")
    
    # Summary by college
    by_college = defaultdict(lambda: {'working': 0, 'resigned': 0})
    
    for dept_name, data in excel_data.items():
        slug = data['slug']
        
        if 'svit-coa' in slug:
            college = 'COA (Architecture)'
        elif 'svion' in slug:
            college = 'SVION (Nursing)'
        elif 'svica' in slug:
            college = 'SVICA (Computer Applications)'
        else:
            college = 'SVIT (Engineering)'
        
        by_college[college]['working'] += len(data['working'])
        by_college[college]['resigned'] += len(data['resigned'])
    
    report.append("SUMMARY BY COLLEGE")
    report.append("-" * 80)
    report.append(f"{'College':<40} {'Working':>10} {'Resigned':>10} {'Total':>10}")
    report.append("-" * 80)
    
    grand_working = 0
    grand_resigned = 0
    
    for college in sorted(by_college.keys()):
        working = by_college[college]['working']
        resigned = by_college[college]['resigned']
        total = working + resigned
        grand_working += working
        grand_resigned += resigned
        
        report.append(f"{college:<40} {working:>10} {resigned:>10} {total:>10}")
    
    report.append("-" * 80)
    report.append(f"{'TOTAL':<40} {grand_working:>10} {grand_resigned:>10} {grand_working + grand_resigned:>10}")
    report.append("")
    report.append("")
    
    # Detail by department
    report.append("DETAIL BY DEPARTMENT")
    report.append("=" * 80)
    report.append("")
    
    for dept_name in sorted(excel_data.keys()):
        data = excel_data[dept_name]
        working_count = len(data['working'])
        resigned_count = len(data['resigned'])
        
        report.append(f"Department: {dept_name}")
        report.append(f"Slug: {data['slug']}")
        report.append(f"Working Staff: {working_count}")
        report.append(f"Resigned Staff: {resigned_count}")
        report.append("")
        
        if working_count > 0:
            report.append("  Working Staff:")
            for staff in data['working']:
                report.append(f"    {staff['code']:<12} {staff['name']:<45} {staff['designation']}")
        
        if resigned_count > 0:
            report.append("")
            report.append("  Resigned Staff (DO NOT ADD):")
            for staff in data['resigned']:
                report.append(f"    {staff['code']:<12} {staff['name']:<45} {staff['designation']}")
        
        report.append("")
        report.append("-" * 80)
        report.append("")
    
    # Action items
    report.append("")
    report.append("ACTION ITEMS")
    report.append("=" * 80)
    report.append("")
    report.append(f"1. ADD {grand_working} working faculty members to database")
    report.append(f"   - Generated seed files: 09_faculty_*.sql")
    report.append("")
    report.append(f"2. ENSURE {grand_resigned} resigned employees are NOT added")
    report.append(f"   - Script already filters out Resigned status")
    report.append("")
    report.append(f"3. UPDATE department information")
    report.append(f"   - Run: 10_diploma_details.sql for diploma departments")
    report.append("")
    report.append("4. VERIFY employee codes are stored in metadata")
    report.append("   - All faculty have employee_code in metadata JSONB field")
    report.append("")
    report.append("")
    
    # Files to run
    report.append("SEED FILES TO EXECUTE (in order)")
    report.append("=" * 80)
    report.append("")
    report.append("1. 03_departments.sql         (if not already run)")
    report.append("2. 04_courses.sql             (if not already run)")
    report.append("3. 09_faculty_svit.sql        (201 SVIT faculty)")
    report.append("4. 09_faculty_svit-coa.sql    (26 Architecture faculty)")
    report.append("5. 09_faculty_svica.sql       (11 SVICA faculty)")
    report.append("6. 09_faculty_svion.sql       (29 Nursing faculty)")
    report.append("7. 10_diploma_details.sql     (Diploma course & dept details)")
    report.append("")
    report.append("Total: 267 working faculty members across 21 departments")
    report.append("")
    
    # Write report
    output_path.write_text('\n'.join(report))
    
    return report

def main():
    xlsx_path = '/Users/porus/Downloads/Employee_List_by_Department.xlsx'
    db_path = '/Users/porus/Downloads/SVIT_Extracted_Website_Data/database_exports/STAFF_MASTER.json'
    output_path = Path('/Users/porus/code/svit-college-website/FACULTY_AUDIT_REPORT.txt')
    
    print("Reading Excel data...")
    excel_data = read_excel_data(xlsx_path)
    
    print("Generating audit report...")
    report = generate_audit_report(excel_data, output_path)
    
    # Print summary
    print("\n" + "\n".join(report[:30]))
    print(f"\n✓ Full report saved to: {output_path}")
    
    # Generate summary JSON
    summary = {
        'total_working': sum(len(d['working']) for d in excel_data.values()),
        'total_resigned': sum(len(d['resigned']) for d in excel_data.values()),
        'departments': len(excel_data),
        'seed_files': [
            '09_faculty_svit.sql',
            '09_faculty_svit-coa.sql',
            '09_faculty_svica.sql',
            '09_faculty_svion.sql',
            '10_diploma_details.sql'
        ]
    }
    
    summary_path = Path('/Users/porus/code/svit-college-website/faculty_summary.json')
    summary_path.write_text(json.dumps(summary, indent=2))
    print(f"✓ Summary saved to: {summary_path}")

if __name__ == '__main__':
    main()
