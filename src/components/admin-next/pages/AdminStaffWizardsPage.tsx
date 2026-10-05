'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { useUserScope } from '@/hooks/useUserScope';
import type { UserScope } from '@/hooks/useUserScope';
import { MediaUploader } from '@/components/admin-next/MediaUploader';
import { Users, Plus, Trash2, Loader2, Save, Award, Search, X, Tag, School, UserCircle, Upload, FileUp, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/app/lib/auth/admin';
import { parseFacultyCsv, importFacultyCsv, buildFacultyTemplateCsv, type FacultyImportSummary } from '@/lib/faculty-import';
import { compareByMuster } from '@/lib/staff-order';
import { findMusterConflict, parseMusterNumber } from '@/lib/muster-check';
import { PICKER_DESIGNATION_CATEGORIES, STAFF_POST_COLUMNS, formatDesignationWithPosts, postsForIds, type StaffPost } from '@/lib/staff-posts';
import { parseAchievementsCsv, importAchievementsCsv, buildAchievementsTemplateCsv, type AchievementImportSummary } from '@/lib/staff-achievements-import';
import { normalizePhone } from '@/lib/phone';

type AchievementType = 'award' | 'patent' | 'publication' | 'research' | 'qualification' | 'activity';

const ACHIEVEMENT_TYPES: { value: AchievementType; label: string }[] = [
  { value: 'qualification', label: 'Qualification / Degree' },
  { value: 'award', label: 'Award / Honor' },
  { value: 'patent', label: 'Patent' },
  { value: 'publication', label: 'Publication' },
  { value: 'research', label: 'Research Project' },
  { value: 'activity', label: 'Activity' },
];

type WorkExperienceCategory = 'industry' | 'teaching';

const WORK_EXPERIENCE_CATEGORIES: { value: WorkExperienceCategory; label: string }[] = [
  { value: 'industry', label: 'Industry' },
  { value: 'teaching', label: 'Teaching / Academic' },
];

const MONTH_OPTIONS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

type Tab = 'general' | 'department' | 'experience' | 'achievements' | 'expertise';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'general', label: 'General', icon: UserCircle },
  { id: 'department', label: 'Department', icon: School },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'expertise', label: 'Expertise', icon: Tag },
];

export function AdminStaffWizardsPage({ admin }: { admin: AdminUser }) {
  const supabase = useMemo(() => createClient(), []);
  const userScope = useUserScope(admin.roles as any);

  const [staffList, setStaffList] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'muster'>('name');
  const [listLoading, setListLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [panelOpen, setPanelOpen] = useState(false);
  const [isNewMode, setIsNewMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [posts, setPosts] = useState<StaffPost[]>([]);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [generalForm, setGeneralForm] = useState<Record<string, any>>({});
  const [generalSaving, setGeneralSaving] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [workExperience, setWorkExperience] = useState<any[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);

  const [newAssignment, setNewAssignment] = useState<{ department_id: string; designation_id: string; post_ids: string[]; is_primary: boolean }>({
    department_id: '',
    designation_id: '',
    post_ids: [],
    is_primary: false,
  });
  const [editingPostsFor, setEditingPostsFor] = useState<string | null>(null);
  const [newAchievement, setNewAchievement] = useState<{ type: AchievementType; title: string; year: string; description: string }>({
    type: 'award',
    title: '',
    year: '',
    description: '',
  });
  const emptyWorkExperience = {
    category: 'teaching' as WorkExperienceCategory,
    position: '',
    organization: '',
    start_month: '',
    start_year: '',
    end_month: '',
    end_year: '',
    is_current: false,
    description: '',
  };
  const [newWorkExperience, setNewWorkExperience] = useState(emptyWorkExperience);
  const [newTag, setNewTag] = useState('');
  const [newStaffForm, setNewStaffForm] = useState({ title: 'Dr.', first_name: '', middle_name: '', last_name: '', employee_code: '', email: '', phone: '' });
  const [createLoading, setCreateLoading] = useState(false);

  const [importFacultyOpen, setImportFacultyOpen] = useState(false);
  const [importAchievementsOpen, setImportAchievementsOpen] = useState(false);

  useEffect(() => {
    loadStaffList();
    loadMasters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId && !isNewMode) {
      loadDetails(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function loadStaffList() {
    setListLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff_profiles')
        .select(
          `
          id, title, first_name, last_name, email, status, expertise, metadata, muster_number, photo_url,
          staff_department_assignments(
            is_primary,
            post_ids,
            department_id,
            department:department_id(name),
            designation:designation_id(title)
          )
        `
        )
        .is('deleted_at', null)
        .order('first_name');
      if (error) throw error;
      setStaffList(data || []);
    } catch {
      try {
        const { data } = await supabase.from('staff_profiles').select('id, title, first_name, last_name, email, status, expertise, metadata, muster_number, photo_url').is('deleted_at', null).order('first_name');
        setStaffList(data || []);
      } catch (err) {
        // Both the full and the reduced query failed — leave the list as-is,
        // but report why it did not load.
        console.error('Failed to load staff list', err);
      }
    } finally {
      setListLoading(false);
    }
  }

  async function loadMasters() {
    const [{ data: d }, { data: des }, { data: p }] = await Promise.all([
      supabase.from('departments').select('id, name, code, college_id').is('deleted_at', null).order('name'),
      supabase.from('designations').select('id, title, category, is_selectable').is('deleted_at', null).order('title'),
      supabase.from('staff_posts').select(STAFF_POST_COLUMNS).eq('status', 'published').is('deleted_at', null).order('sort_order'),
    ]);
    setDepartments(d || []);
    setDesignations(des || []);
    setPosts(p || []);
  }

  async function loadDetails(staffId: string) {
    setDetailsLoading(true);
    try {
      const [{ data: gen }, { data: asgn }, { data: achv }, { data: workExp }] = await Promise.all([
        supabase.from('staff_profiles').select('*').eq('id', staffId).maybeSingle(),
        supabase
          .from('staff_department_assignments')
          .select('id, department_id, designation_id, post_ids, is_primary, department:department_id(name,code), designation:designation_id(title)')
          .eq('staff_id', staffId)
          .is('deleted_at', null),
        (supabase as any).from('staff_achievements').select('*').eq('staff_id', staffId).is('deleted_at', null).order('year', { ascending: false }),
        (supabase as any)
          .from('staff_work_experience')
          .select('*')
          .eq('staff_id', staffId)
          .is('deleted_at', null)
          .order('is_current', { ascending: false })
          .order('start_year', { ascending: false })
          .order('start_month', { ascending: false }),
      ]);
      // office_hours must be an array of {day, time}; older rows held {}.
      setGeneralForm(gen ? { ...gen, office_hours: Array.isArray(gen.office_hours) ? gen.office_hours : [] } : {});
      setAssignments(asgn || []);
      setAchievements(achv || []);
      setWorkExperience(workExp || []);
      setExpertise(gen?.expertise || []);
    } catch (err: any) {
      toast.error(`Failed to load profile: ${err.message}`);
    } finally {
      setDetailsLoading(false);
    }
  }

  function openCard(id: string) {
    setSelectedId(id);
    setIsNewMode(false);
    setActiveTab('general');
    setPanelOpen(true);
  }

  function openNew() {
    setSelectedId(null);
    setIsNewMode(true);
    setActiveTab('general');
    setNewStaffForm({ title: 'Dr.', first_name: '', middle_name: '', last_name: '', employee_code: '', email: '', phone: '' });
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setSelectedId(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const employeeCode = newStaffForm.employee_code.trim();
    if (!/^\d{1,4}-[A-Za-z]{2,6}$/.test(employeeCode)) {
      toast.error('Employee code is required, format: 1–4 digit number + hyphen + initials, e.g. 1265-NIC.');
      return;
    }
    const phone = normalizePhone(newStaffForm.phone);
    if (phone.error) {
      toast.error(phone.error);
      return;
    }
    setCreateLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff_profiles')
        .insert({ ...newStaffForm, phone: phone.value, employee_code: employeeCode, status: 'published', created_by: admin.id })
        .select()
        .single();
      if (error) throw error;
      toast.success('Staff profile created!');
      await loadStaffList();
      setSelectedId(data.id);
      setIsNewMode(false);
      setActiveTab('general');
    } catch (err: any) {
      toast.error(err.code === '23505' ? `Employee code ${employeeCode} is already used by another staff member.` : err.message);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleSaveGeneral(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setGeneralSaving(true);
    try {
      const currentMeta = (generalForm.metadata as Record<string, any>) ?? {};
      const employeeCode = (generalForm.employee_code || '').trim();
      if (!/^\d{1,4}-[A-Za-z]{2,6}$/.test(employeeCode)) {
        toast.error('Employee code is required, format: 1–4 digit number + hyphen + initials, e.g. 1265-NIC.');
        return;
      }
      const musterNumber = parseMusterNumber(generalForm.muster_number);
      if (musterNumber === undefined) {
        toast.error('Muster number must be a whole number (0 or higher).');
        return;
      }
      const phone = normalizePhone(generalForm.phone);
      if (phone.error) {
        toast.error(phone.error);
        return;
      }
      if (musterNumber !== null) {
        const collegeIds = [
          ...new Set(
            assignments
              .map((a) => departments.find((d) => d.id === a.department_id)?.college_id)
              .filter((id): id is string => Boolean(id))
          ),
        ];
        const clash = await findMusterConflict(supabase, musterNumber, collegeIds, selectedId);
        if (clash) {
          toast.error(`Muster number ${musterNumber} is already assigned to ${clash} in the same college.`);
          return;
        }
      }
      const { error } = await supabase
        .from('staff_profiles')
        .update({
          title: generalForm.title,
          first_name: generalForm.first_name,
          middle_name: generalForm.middle_name || null,
          last_name: generalForm.last_name,
          employee_code: employeeCode,
          email: generalForm.email,
          phone: phone.value,
          bio: generalForm.bio,
          qualification: generalForm.qualification || null,
          muster_number: musterNumber,
          photo_url: generalForm._photoUrl ?? generalForm.photo_url ?? null,
          office_hours: (generalForm.office_hours || []).filter((oh: any) => oh?.day?.trim() && oh?.time?.trim()),
          social_links: Object.fromEntries(
            Object.entries(generalForm.social_links || {}).filter(
              (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim() !== ''
            )
          ),
          metadata: currentMeta,
          status: generalForm.status || 'published',
          updated_by: admin.id,
        })
        .eq('id', selectedId);
      if (error) throw error;
      toast.success('Profile saved!');
      loadStaffList();
    } catch (err: any) {
      toast.error(err.code === '23505' ? `Employee code ${generalForm.employee_code} is already used by another staff member.` : err.message);
    } finally {
      setGeneralSaving(false);
    }
  }

  async function handleSoftDelete(staffId: string) {
    if (!confirm('Move this staff profile to trash?')) return;
    try {
      await supabase.from('staff_profiles').update({ deleted_at: new Date().toISOString(), deleted_by: admin.id }).eq('id', staffId);
      toast.success('Moved to trash.');
      if (selectedId === staffId) closePanel();
      loadStaffList();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleAddAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    try {
      const { data: current } = await supabase.from('staff_profiles').select('muster_number').eq('id', selectedId).maybeSingle();
      const collegeId = departments.find((d) => d.id === newAssignment.department_id)?.college_id;
      if (current?.muster_number != null && collegeId) {
        const clash = await findMusterConflict(supabase, current.muster_number, [collegeId], selectedId);
        if (clash) {
          toast.error(`Muster number ${current.muster_number} is already assigned to ${clash} in that college. Change it in General first.`);
          return;
        }
      }
      const { error } = await supabase.from('staff_department_assignments').insert({
        staff_id: selectedId,
        department_id: newAssignment.department_id,
        designation_id: newAssignment.designation_id,
        post_ids: newAssignment.post_ids,
        is_primary: newAssignment.is_primary,
        status: 'published',
      });
      if (error) throw error;
      toast.success('Assignment added!');
      setNewAssignment({ department_id: '', designation_id: '', post_ids: [], is_primary: false });
      loadDetails(selectedId);
      loadStaffList();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleUpdateAssignmentPosts(assignmentId: string, postIds: string[]) {
    try {
      const { error } = await supabase
        .from('staff_department_assignments')
        .update({ post_ids: postIds, updated_by: admin.id })
        .eq('id', assignmentId);
      if (error) throw error;
      setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, post_ids: postIds } : a)));
      loadStaffList();
    } catch (err: any) {
      // The DB rejects a second HOD / I/C HOD in the same department and names the current head.
      toast.error(err.message);
    }
  }

  async function handleDeleteAssignment(id: string) {
    try {
      await supabase
        .from('staff_department_assignments')
        .update({ deleted_at: new Date().toISOString(), deleted_by: admin.id })
        .eq('id', id);
      toast.success('Removed.');
      loadDetails(selectedId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleAddAchievement(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !newAchievement.title.trim()) return;
    try {
      const { error } = await (supabase as any).from('staff_achievements').insert({
        staff_id: selectedId,
        type: newAchievement.type,
        title: newAchievement.title.trim(),
        year: newAchievement.year ? Number(newAchievement.year) : null,
        description: newAchievement.description.trim() || null,
      });
      if (error) throw error;
      toast.success('Achievement added!');
      setNewAchievement({ type: 'award', title: '', year: '', description: '' });
      loadDetails(selectedId);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDeleteAchievement(id: string) {
    try {
      await (supabase as any)
        .from('staff_achievements')
        .update({ deleted_at: new Date().toISOString(), deleted_by: admin.id })
        .eq('id', id);
      toast.success('Removed.');
      loadDetails(selectedId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function validateWorkExperience(w: typeof newWorkExperience): string | null {
    const startMonth = Number(w.start_month);
    const startYear = Number(w.start_year);
    if (!w.position.trim() || !w.organization.trim()) return 'Position and Organization are required.';
    if (!startMonth || !startYear) return 'Start month and year are required.';
    if (startYear < 1950) return 'Start year looks like a typo — must be 1950 or later.';
    const now = new Date();
    if (startYear * 12 + startMonth > now.getFullYear() * 12 + now.getMonth() + 1) {
      return 'Start date cannot be in the future.';
    }
    if (!w.is_current) {
      const endMonth = Number(w.end_month);
      const endYear = Number(w.end_year);
      if (!endMonth || !endYear) return 'End month and year are required unless "Currently Working" is checked.';
      if (endYear * 12 + endMonth < startYear * 12 + startMonth) return 'End date cannot be before the start date.';
    }
    return null;
  }

  async function handleAddWorkExperience(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    const error = validateWorkExperience(newWorkExperience);
    if (error) {
      toast.error(error);
      return;
    }
    try {
      const { error: insertErr } = await (supabase as any).from('staff_work_experience').insert({
        staff_id: selectedId,
        category: newWorkExperience.category,
        position: newWorkExperience.position.trim(),
        organization: newWorkExperience.organization.trim(),
        start_month: Number(newWorkExperience.start_month),
        start_year: Number(newWorkExperience.start_year),
        end_month: newWorkExperience.is_current ? null : Number(newWorkExperience.end_month),
        end_year: newWorkExperience.is_current ? null : Number(newWorkExperience.end_year),
        is_current: newWorkExperience.is_current,
        description: newWorkExperience.description.trim() || null,
        created_by: admin.id,
      });
      if (insertErr) throw insertErr;
      toast.success('Work experience added!');
      setNewWorkExperience(emptyWorkExperience);
      loadDetails(selectedId);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDeleteWorkExperience(id: string) {
    try {
      await (supabase as any)
        .from('staff_work_experience')
        .update({ deleted_at: new Date().toISOString(), deleted_by: admin.id })
        .eq('id', id);
      toast.success('Removed.');
      loadDetails(selectedId!);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    const tag = newTag.trim();
    if (!tag || !selectedId) return;
    if (expertise.includes(tag)) {
      setNewTag('');
      return;
    }
    const updated = [...expertise, tag];
    try {
      const { error } = await supabase.from('staff_profiles').update({ expertise: updated }).eq('id', selectedId);
      if (error) throw error;
      setExpertise(updated);
      setNewTag('');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleRemoveTag(tag: string) {
    if (!selectedId) return;
    const updated = expertise.filter((t) => t !== tag);
    try {
      const { error } = await supabase.from('staff_profiles').update({ expertise: updated }).eq('id', selectedId);
      if (error) throw error;
      setExpertise(updated);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  const scopedDepartmentIds = useMemo(() => {
    if (userScope.level === 'department' && userScope.departmentId) {
      return new Set([userScope.departmentId]);
    }
    if (userScope.level === 'college' && userScope.collegeId) {
      return new Set(departments.filter((d) => d.college_id === userScope.collegeId).map((d) => d.id));
    }
    return null;
  }, [userScope, departments]);

  const visibleStaffList = useMemo(() => {
    if (!scopedDepartmentIds) return staffList;
    return staffList.filter((s) => (s.staff_department_assignments ?? []).some((a: any) => scopedDepartmentIds.has(a.department_id)));
  }, [staffList, scopedDepartmentIds]);

  const scopedDepartments = useMemo(() => {
    if (!scopedDepartmentIds) return departments;
    return departments.filter((d) => scopedDepartmentIds.has(d.id));
  }, [departments, scopedDepartmentIds]);

  const ownDepartmentCode = useMemo(() => {
    if (userScope.level !== 'department' || !userScope.departmentId) return undefined;
    return departments.find((d) => d.id === userScope.departmentId)?.code;
  }, [departments, userScope]);

  const filteredStaff = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const matched = !searchQuery
      ? visibleStaffList
      : visibleStaffList.filter((s) => {
          const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
          return name.includes(q) || (s.email || '').toLowerCase().includes(q);
        });
    if (sortBy !== 'muster') return matched;
    return [...matched].sort((a, b) =>
      compareByMuster(
        { name: `${a.first_name || ''} ${a.last_name || ''}`.trim(), musterNumber: a.muster_number },
        { name: `${b.first_name || ''} ${b.last_name || ''}`.trim(), musterNumber: b.muster_number }
      )
    );
  }, [visibleStaffList, searchQuery, sortBy]);

  const designationGroups = useMemo(
    () =>
      PICKER_DESIGNATION_CATEGORIES.map((c) => ({
        ...c,
        options: designations.filter((d) => d.is_selectable && d.category === c.value),
      })).filter((g) => g.options.length > 0),
    [designations]
  );

  const getPrimary = (staff: any) => {
    const assignments = staff.staff_department_assignments;
    if (!assignments?.length) return null;
    return assignments.find((a: any) => a.is_primary) || assignments[0];
  };

  const achievementsByType = useMemo(() => {
    const groups: Record<string, any[]> = {};
    achievements.forEach((a) => {
      if (!groups[a.type]) groups[a.type] = [];
      groups[a.type].push(a);
    });
    return groups;
  }, [achievements]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy flex items-center gap-2">
            <Users className="h-5 w-5 text-crimson" />
            Faculty &amp; Staff
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{visibleStaffList.length} profiles total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportAchievementsOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:border-crimson hover:text-crimson transition"
          >
            <FileUp className="h-4 w-4" />
            Import Achievements
          </button>
          <button
            onClick={() => setImportFacultyOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:border-crimson hover:text-crimson transition"
          >
            <Upload className="h-4 w-4" />
            Import Faculty
          </button>
          <button onClick={openNew} className="flex items-center gap-1.5 rounded-lg bg-crimson px-3.5 py-2 text-sm font-semibold text-white hover:bg-crimson/90 transition shadow-sm">
            <Plus className="h-4 w-4" />
            Add Faculty
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-crimson focus:outline-none"
        />
      </div>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as 'name' | 'muster')}
        aria-label="Sort staff"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
      >
        <option value="name">Sort: Name</option>
        <option value="muster">Sort: Muster number</option>
      </select>
      </div>

      {listLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-crimson" />
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-center rounded-xl border border-slate-200 bg-white">
          <Users className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">No faculty profiles found</p>
          <button onClick={openNew} className="mt-3 text-xs text-crimson hover:underline">
            Add the first profile →
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStaff.map((staff) => {
            const primary = getPrimary(staff);
            const initials = `${staff.first_name?.[0] || ''}${staff.last_name?.[0] || ''}`;
            const isSelected = staff.id === selectedId && panelOpen;

            return (
              <div
                key={staff.id}
                onClick={() => openCard(staff.id)}
                className={cn(
                  'group relative rounded-xl border bg-white p-4 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md',
                  isSelected ? 'border-crimson/50 ring-1 ring-crimson/20' : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-start gap-3">
                  {staff.photo_url ? (
                    <img src={staff.photo_url} alt="" className="h-11 w-11 rounded-full object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-crimson/10 text-sm font-bold text-crimson border border-crimson/20">{initials || '?'}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm leading-snug truncate">
                      {staff.title} {staff.first_name} {staff.last_name}
                    </p>
                    {primary && (
                      <p className="text-xs text-slate-600 truncate mt-0.5">
                        {formatDesignationWithPosts(primary.designation?.title || '', postsForIds(primary.post_ids, posts)) || '—'}
                      </p>
                    )}
                    {primary && <p className="text-[11px] text-slate-400 truncate">{primary.department?.name || ''}</p>}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold border',
                      staff.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    )}
                  >
                    {staff.status || 'draft'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSoftDelete(staff.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {panelOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={closePanel} />

          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-3xl flex-col bg-[#16181d] shadow-2xl border-l border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 shrink-0">
              <h2 className="font-semibold text-white text-sm">
                {isNewMode
                  ? 'New Faculty Profile'
                  : selectedId
                    ? `${generalForm.title || ''} ${generalForm.first_name || ''} ${generalForm.middle_name || ''} ${generalForm.last_name || ''}`.replace(/\s+/g, ' ').trim() || 'Edit Profile'
                    : 'Edit Profile'}
              </h2>
              <button onClick={closePanel} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            {isNewMode ? (
              <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 space-y-4 admin-scroll">
                <p className="text-xs text-zinc-500">Fill in the basics. You can add more details after creating.</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Title</label>
                    <select
                      value={newStaffForm.title}
                      onChange={(e) => setNewStaffForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white focus:border-crimson focus:outline-none"
                    >
                      {['Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.'].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">First Name</label>
                    <input
                      required
                      type="text"
                      value={newStaffForm.first_name}
                      onChange={(e) => setNewStaffForm((p) => ({ ...p, first_name: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-crimson focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Last Name</label>
                  <input
                    required
                    type="text"
                    value={newStaffForm.last_name}
                    onChange={(e) => setNewStaffForm((p) => ({ ...p, last_name: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-crimson focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Middle Name (optional)</label>
                  <input
                    type="text"
                    value={newStaffForm.middle_name}
                    onChange={(e) => setNewStaffForm((p) => ({ ...p, middle_name: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-crimson focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Employee Code</label>
                  <input
                    required
                    type="text"
                    pattern="^\d{1,4}-[A-Za-z]{2,6}$"
                    title="Format: 1–4 digit number, hyphen, initials — e.g. 1265-NIC"
                    placeholder="e.g. 1265-NIC"
                    value={newStaffForm.employee_code}
                    onChange={(e) => setNewStaffForm((p) => ({ ...p, employee_code: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-crimson focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500">
                    1–4 digit number + hyphen + initials, e.g. <span className="font-mono">1265-NIC</span>. Used to build the faculty's public profile link.
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Email</label>
                  <input
                    required
                    type="email"
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-crimson focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-crimson focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500">Internal use only — never shown on the public site.</p>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={closePanel} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-white transition">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 disabled:opacity-50 transition"
                  >
                    {createLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Create Profile
                  </button>
                </div>
              </form>
            ) : detailsLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-crimson" />
              </div>
            ) : (
              <>
                <div className="flex border-b border-zinc-800 shrink-0">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          'flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-semibold transition flex-1 justify-center',
                          activeTab === tab.id ? 'border-crimson text-crimson' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 overflow-y-auto admin-scroll p-5">
                  {activeTab === 'general' && (
                    <form onSubmit={handleSaveGeneral} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="field-label">Title</label>
                          <select value={generalForm.title || 'Dr.'} onChange={(e) => setGeneralForm((p) => ({ ...p, title: e.target.value }))} className="field-input">
                            {['Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.'].map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="field-label">Status</label>
                          <select value={generalForm.status || 'published'} onChange={(e) => setGeneralForm((p) => ({ ...p, status: e.target.value }))} className="field-input">
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="field-label">First Name</label>
                          <input type="text" required value={generalForm.first_name || ''} onChange={(e) => setGeneralForm((p) => ({ ...p, first_name: e.target.value }))} className="field-input" />
                        </div>
                        <div className="space-y-1">
                          <label className="field-label">Last Name</label>
                          <input type="text" required value={generalForm.last_name || ''} onChange={(e) => setGeneralForm((p) => ({ ...p, last_name: e.target.value }))} className="field-input" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="field-label">Middle Name (optional)</label>
                        <input type="text" value={generalForm.middle_name || ''} onChange={(e) => setGeneralForm((p) => ({ ...p, middle_name: e.target.value }))} className="field-input" />
                      </div>

                      <div className="space-y-1">
                        <label className="field-label">Employee Code</label>
                        <input
                          type="text"
                          required
                          pattern="^\d{1,4}-[A-Za-z]{2,6}$"
                          title="Format: 1–4 digit number, hyphen, initials — e.g. 1265-NIC"
                          placeholder="e.g. 1265-NIC"
                          value={generalForm.employee_code || ''}
                          onChange={(e) => setGeneralForm((p) => ({ ...p, employee_code: e.target.value }))}
                          className="field-input"
                        />
                        <p className="text-[11px] text-slate-400">
                          1–4 digit number + hyphen + initials, e.g. <span className="font-mono">1265-NIC</span>. Used to build the faculty's public profile link.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="field-label">Email</label>
                        <input type="email" value={generalForm.email || ''} onChange={(e) => setGeneralForm((p) => ({ ...p, email: e.target.value }))} className="field-input" />
                      </div>

                      <div className="space-y-1">
                        <label className="field-label">Phone</label>
                        <input type="text" placeholder="e.g. 9876543210" value={generalForm.phone || ''} onChange={(e) => setGeneralForm((p) => ({ ...p, phone: e.target.value }))} className="field-input" />
                        <p className="text-[11px] text-slate-400">Internal use only — never shown on the public site.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="field-label">Profile Photo</label>
                        <MediaUploader value={generalForm._photoUrl ?? generalForm.photo_url ?? ''} onChange={(url) => setGeneralForm((p) => ({ ...p, _photoUrl: url }))} type="image" bucketName="staff-photos" />
                      </div>

                      <div className="space-y-1">
                        <label className="field-label">Bio</label>
                        <textarea rows={4} value={generalForm.bio || ''} onChange={(e) => setGeneralForm((p) => ({ ...p, bio: e.target.value }))} className="field-input resize-none" />
                      </div>

                      <div className="space-y-1">
                        <label className="field-label">Qualification</label>
                        <input
                          type="text"
                          value={generalForm.qualification || ''}
                          onChange={(e) => setGeneralForm((p) => ({ ...p, qualification: e.target.value }))}
                          placeholder="e.g. M.Tech, Ph.D."
                          className="field-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="field-label">Office Hours</label>
                        {(generalForm.office_hours || []).map((oh: { day: string; time: string }, i: number) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              value={oh.day || ''}
                              onChange={(e) => {
                                const list = [...(generalForm.office_hours || [])];
                                list[i] = { ...list[i], day: e.target.value };
                                setGeneralForm((p) => ({ ...p, office_hours: list }));
                              }}
                              placeholder="Day, e.g. Monday"
                              className="field-input flex-1"
                            />
                            <input
                              type="text"
                              value={oh.time || ''}
                              onChange={(e) => {
                                const list = [...(generalForm.office_hours || [])];
                                list[i] = { ...list[i], time: e.target.value };
                                setGeneralForm((p) => ({ ...p, office_hours: list }));
                              }}
                              placeholder="Time, e.g. 10am - 12pm"
                              className="field-input flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const list = (generalForm.office_hours || []).filter((_: unknown, idx: number) => idx !== i);
                                setGeneralForm((p) => ({ ...p, office_hours: list }));
                              }}
                              className="rounded-lg border border-zinc-800 px-2 text-zinc-400 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setGeneralForm((p) => ({ ...p, office_hours: [...(p.office_hours || []), { day: '', time: '' }] }))
                          }
                          className="flex items-center gap-1 text-xs font-medium text-crimson hover:text-crimson/80"
                        >
                          <Plus className="h-3 w-3" /> Add office hours row
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="field-label">Social / Profile Links</label>
                        <input
                          type="url"
                          value={generalForm.social_links?.linkedin || ''}
                          onChange={(e) =>
                            setGeneralForm((p) => ({ ...p, social_links: { ...(p.social_links || {}), linkedin: e.target.value } }))
                          }
                          placeholder="LinkedIn URL"
                          className="field-input"
                        />
                        <input
                          type="url"
                          value={generalForm.social_links?.googleScholar || ''}
                          onChange={(e) =>
                            setGeneralForm((p) => ({
                              ...p,
                              social_links: { ...(p.social_links || {}), googleScholar: e.target.value },
                            }))
                          }
                          placeholder="Google Scholar URL"
                          className="field-input"
                        />
                        <input
                          type="url"
                          value={generalForm.social_links?.orcid || ''}
                          onChange={(e) =>
                            setGeneralForm((p) => ({ ...p, social_links: { ...(p.social_links || {}), orcid: e.target.value } }))
                          }
                          placeholder="ORCID URL"
                          className="field-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="field-label">Muster Number</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={generalForm.muster_number ?? ''}
                          onChange={(e) => setGeneralForm((p) => ({ ...p, muster_number: e.target.value }))}
                          placeholder="e.g. 0"
                          className="field-input"
                        />
                        <p className="text-xs text-muted-foreground">Used only to order staff on public pages (lowest first). Not shown publicly. Unique within a college.</p>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-zinc-800">
                        <button
                          type="submit"
                          disabled={generalSaving}
                          className="flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 disabled:opacity-50 transition"
                        >
                          {generalSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save Changes
                        </button>
                      </div>
                    </form>
                  )}

                  {activeTab === 'department' && (
                    <div className="space-y-5">
                      <form onSubmit={handleAddAssignment} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Add Assignment</h3>
                        <div className="space-y-1">
                          <label className="field-label">Department</label>
                          <select
                            required
                            value={newAssignment.department_id}
                            onChange={(e) => setNewAssignment((p) => ({ ...p, department_id: e.target.value }))}
                            className="field-input"
                          >
                            <option value="">Select department…</option>
                            {scopedDepartments.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.code})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="field-label">Designation</label>
                          <select
                            required
                            value={newAssignment.designation_id}
                            onChange={(e) => setNewAssignment((p) => ({ ...p, designation_id: e.target.value }))}
                            className="field-input"
                          >
                            <option value="">Select designation…</option>
                            {designationGroups.map((g) => (
                              <optgroup key={g.value} label={g.label}>
                                {g.options.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.title}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="field-label">Post (optional)</label>
                          <PostPicker posts={posts} value={newAssignment.post_ids} onChange={(post_ids) => setNewAssignment((p) => ({ ...p, post_ids }))} />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newAssignment.is_primary}
                              onChange={(e) => setNewAssignment((p) => ({ ...p, is_primary: e.target.checked }))}
                              className="h-3.5 w-3.5 rounded border-zinc-600 text-crimson"
                            />
                            Primary assignment
                          </label>
                          <button type="submit" className="rounded-lg bg-crimson px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-crimson/90 transition">
                            Add
                          </button>
                        </div>
                      </form>

                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Current Assignments</h3>
                        {assignments.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-600">No assignments. This faculty won&apos;t appear in any department.</p>
                        ) : (
                          <div className="space-y-2">
                            {assignments.map((a) => (
                              <div key={a.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-white">{a.department?.name || '—'}</p>
                                    <p className="text-xs text-zinc-500">
                                      {formatDesignationWithPosts(a.designation?.title || '', postsForIds(a.post_ids, posts)) || '—'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {a.is_primary && (
                                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">Primary</span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setEditingPostsFor((cur) => (cur === a.id ? null : a.id))}
                                      className="rounded px-1.5 py-0.5 text-[11px] font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                                    >
                                      {editingPostsFor === a.id ? 'Done' : 'Posts'}
                                    </button>
                                    <button onClick={() => handleDeleteAssignment(a.id)} className="rounded p-1 text-zinc-600 hover:bg-rose-500/10 hover:text-rose-400 transition">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                                {editingPostsFor === a.id && (
                                  <PostPicker posts={posts} value={a.post_ids ?? []} onChange={(ids) => handleUpdateAssignmentPosts(a.id, ids)} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'experience' && (
                    <div className="space-y-5">
                      <form onSubmit={handleAddWorkExperience} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Add Work Experience</h3>
                        <div className="space-y-1">
                          <label className="field-label">Category</label>
                          <select
                            value={newWorkExperience.category}
                            onChange={(e) => setNewWorkExperience((p) => ({ ...p, category: e.target.value as WorkExperienceCategory }))}
                            className="field-input"
                          >
                            {WORK_EXPERIENCE_CATEGORIES.map((c) => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="field-label">Position</label>
                            <input
                              required
                              type="text"
                              value={newWorkExperience.position}
                              onChange={(e) => setNewWorkExperience((p) => ({ ...p, position: e.target.value }))}
                              placeholder="e.g. Assistant Professor"
                              className="field-input"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="field-label">Organization</label>
                            <input
                              required
                              type="text"
                              value={newWorkExperience.organization}
                              onChange={(e) => setNewWorkExperience((p) => ({ ...p, organization: e.target.value }))}
                              placeholder="e.g. SVIT, Vasad"
                              className="field-input"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="field-label">Start Month</label>
                            <select value={newWorkExperience.start_month} onChange={(e) => setNewWorkExperience((p) => ({ ...p, start_month: e.target.value }))} className="field-input">
                              <option value="">—</option>
                              {MONTH_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="field-label">Start Year</label>
                            <input
                              type="number"
                              min={1950}
                              max={new Date().getFullYear()}
                              value={newWorkExperience.start_year}
                              onChange={(e) => setNewWorkExperience((p) => ({ ...p, start_year: e.target.value }))}
                              placeholder="e.g. 2015"
                              className="field-input"
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                          <input
                            type="checkbox"
                            checked={newWorkExperience.is_current}
                            onChange={(e) => setNewWorkExperience((p) => ({ ...p, is_current: e.target.checked, end_month: '', end_year: '' }))}
                          />
                          Currently Working
                        </label>
                        {!newWorkExperience.is_current && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="field-label">End Month</label>
                              <select value={newWorkExperience.end_month} onChange={(e) => setNewWorkExperience((p) => ({ ...p, end_month: e.target.value }))} className="field-input">
                                <option value="">—</option>
                                {MONTH_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="field-label">End Year</label>
                              <input
                                type="number"
                                min={1950}
                                max={new Date().getFullYear()}
                                value={newWorkExperience.end_year}
                                onChange={(e) => setNewWorkExperience((p) => ({ ...p, end_year: e.target.value }))}
                                placeholder="e.g. 2020"
                                className="field-input"
                              />
                            </div>
                          </div>
                        )}
                        <div className="space-y-1">
                          <label className="field-label">Description (optional)</label>
                          <textarea
                            rows={2}
                            value={newWorkExperience.description}
                            onChange={(e) => setNewWorkExperience((p) => ({ ...p, description: e.target.value }))}
                            className="field-input resize-none"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button type="submit" className="rounded-lg bg-crimson px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-crimson/90 transition">
                            Add
                          </button>
                        </div>
                      </form>

                      <div className="space-y-2">
                        {workExperience.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-600">No work experience recorded yet.</p>
                        ) : (
                          workExperience.map((w) => (
                            <div key={w.id} className="flex items-start justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {w.position} <span className="text-zinc-500">· {w.organization}</span>
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  {MONTH_OPTIONS[w.start_month - 1]?.label} {w.start_year} —{' '}
                                  {w.is_current ? 'Present' : `${MONTH_OPTIONS[w.end_month - 1]?.label} ${w.end_year}`}
                                  {' · '}
                                  {WORK_EXPERIENCE_CATEGORIES.find((c) => c.value === w.category)?.label}
                                </p>
                                {w.description && <p className="text-xs text-zinc-500 mt-0.5">{w.description}</p>}
                              </div>
                              <button onClick={() => handleDeleteWorkExperience(w.id)} className="rounded p-1 text-zinc-600 hover:bg-rose-500/10 hover:text-rose-400 transition shrink-0">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'achievements' && (
                    <div className="space-y-5">
                      <form onSubmit={handleAddAchievement} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Add Achievement</h3>
                        <div className="space-y-1">
                          <label className="field-label">Type</label>
                          <select
                            value={newAchievement.type}
                            onChange={(e) => setNewAchievement((p) => ({ ...p, type: e.target.value as AchievementType }))}
                            className="field-input"
                          >
                            {ACHIEVEMENT_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="field-label">Title</label>
                          <input
                            required
                            type="text"
                            value={newAchievement.title}
                            onChange={(e) => setNewAchievement((p) => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Best Paper Award, M.Tech CS, 5 years at GTU…"
                            className="field-input"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="field-label">Year (optional)</label>
                            <input
                              type="number"
                              value={newAchievement.year}
                              onChange={(e) => setNewAchievement((p) => ({ ...p, year: e.target.value }))}
                              placeholder="2023"
                              className="field-input"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="field-label">Description (optional)</label>
                            <input
                              type="text"
                              value={newAchievement.description}
                              onChange={(e) => setNewAchievement((p) => ({ ...p, description: e.target.value }))}
                              className="field-input"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button type="submit" className="rounded-lg bg-crimson px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-crimson/90 transition">
                            Add
                          </button>
                        </div>
                      </form>

                      <div className="space-y-4">
                        {Object.keys(achievementsByType).length === 0 ? (
                          <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-600">No achievements recorded yet.</p>
                        ) : (
                          ACHIEVEMENT_TYPES.filter((t) => achievementsByType[t.value]?.length).map((t) => (
                            <div key={t.value}>
                              <p className="mb-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.label}</p>
                              <div className="space-y-2">
                                {achievementsByType[t.value].map((a: any) => (
                                  <div key={a.id} className="flex items-start justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                                    <div>
                                      <p className="text-sm font-medium text-white">{a.title}</p>
                                      {(a.year || a.description) && (
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                          {a.year && <span>{a.year}</span>}
                                          {a.year && a.description && ' · '}
                                          {a.description}
                                        </p>
                                      )}
                                    </div>
                                    <button onClick={() => handleDeleteAchievement(a.id)} className="rounded p-1 text-zinc-600 hover:bg-rose-500/10 hover:text-rose-400 transition shrink-0">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'expertise' && (
                    <div className="space-y-5">
                      <form onSubmit={handleAddTag} className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="e.g. Machine Learning, VLSI, Data Structures…"
                          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-crimson focus:outline-none"
                        />
                        <button type="submit" className="rounded-lg bg-crimson px-3.5 py-2 text-sm font-semibold text-white hover:bg-crimson/90 transition shrink-0">
                          Add
                        </button>
                      </form>

                      {expertise.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-600">No expertise tags yet. Add areas of specialization above.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {expertise.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 pl-3 pr-2 py-1 text-xs font-medium text-zinc-300">
                              {tag}
                              <button onClick={() => handleRemoveTag(tag)} className="rounded-full p-0.5 text-zinc-500 hover:bg-zinc-700 hover:text-white transition">
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {importFacultyOpen && (
        <ImportFacultyModal
          supabase={supabase}
          admin={admin}
          scope={userScope}
          departments={departments}
          designations={designations}
          posts={posts}
          ownDepartmentCode={ownDepartmentCode}
          onClose={() => setImportFacultyOpen(false)}
          onDone={loadStaffList}
        />
      )}

      {importAchievementsOpen && (
        <ImportAchievementsModal supabase={supabase} scope={userScope} departments={departments} onClose={() => setImportAchievementsOpen(false)} />
      )}
    </div>
  );
}

// Multi-select of posts as toggle chips; none selected means no post.
function PostPicker({ posts, value, onChange }: { posts: StaffPost[]; value: string[]; onChange: (ids: string[]) => void }) {
  if (posts.length === 0) return <p className="text-xs text-zinc-600">No posts defined.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {posts.map((p) => {
        const active = value.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? value.filter((id) => id !== p.id) : [...value, p.id])}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs font-medium transition',
              active ? 'border-crimson bg-crimson/15 text-white' : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            )}
          >
            {p.title}
          </button>
        );
      })}
    </div>
  );
}

function ImportModalShell({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-black/30">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-navy">
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-display text-lg font-bold text-navy">{title}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ImportFacultyModal({
  supabase,
  admin,
  scope,
  departments,
  designations,
  posts,
  ownDepartmentCode,
  onClose,
  onDone,
}: {
  supabase: ReturnType<typeof createClient>;
  admin: AdminUser;
  scope: UserScope;
  departments: any[];
  designations: any[];
  posts: StaffPost[];
  ownDepartmentCode?: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<FacultyImportSummary | null>(null);

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    try {
      const { rows, parseErrors } = await parseFacultyCsv(file);
      const result = await importFacultyCsv(supabase, rows, { adminId: admin.id, scope, departments, designations, posts });
      result.errors = [...parseErrors, ...result.errors];
      setSummary(result);
      if (result.created + result.updated > 0) {
        toast.success(`Imported ${result.created + result.updated} faculty record(s).`);
        onDone();
      }
    } catch (err: any) {
      toast.error(err.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <ImportModalShell title="Import Faculty" subtitle="Upload a CSV for your department. Existing faculty (matched by email) are updated; new emails create new profiles." onClose={onClose}>
      {!summary ? (
        <div className="space-y-4">
          <button type="button" onClick={() => downloadCsv('faculty_import_template.csv', buildFacultyTemplateCsv(ownDepartmentCode))} className="text-xs text-crimson hover:underline">
            Download CSV template →
          </button>

          <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-600 cursor-pointer hover:border-crimson hover:text-crimson transition">
            <Upload className="h-4 w-4 shrink-0" />
            <span className="truncate">{file ? file.name : 'Choose CSV file…'}</span>
            <input type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:text-navy transition">
              Cancel
            </button>
            <button
              type="button"
              disabled={!file || importing}
              onClick={handleImport}
              className="flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 disabled:opacity-50 transition"
            >
              {importing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Import
            </button>
          </div>
        </div>
      ) : (
        <ImportResultSummary
          badges={[
            { label: `${summary.created} created`, tone: 'emerald' },
            { label: `${summary.updated} updated`, tone: 'sky' },
            { label: `${summary.errors.length} error(s)`, tone: 'rose' },
          ]}
          errors={summary.errors}
          onReset={() => {
            setSummary(null);
            setFile(null);
          }}
          onClose={onClose}
        />
      )}
    </ImportModalShell>
  );
}

function ImportAchievementsModal({
  supabase,
  scope,
  departments,
  onClose,
}: {
  supabase: ReturnType<typeof createClient>;
  scope: UserScope;
  departments: any[];
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<AchievementImportSummary | null>(null);

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    try {
      const { rows, parseErrors } = await parseAchievementsCsv(file);
      const result = await importAchievementsCsv(supabase, rows, { scope, departments });
      result.errors = [...parseErrors, ...result.errors];
      setSummary(result);
      if (result.created > 0) {
        toast.success(`Imported ${result.created} achievement(s).`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <ImportModalShell
      title="Import Achievements"
      subtitle="Upload a CSV of achievements, keyed by faculty email. The faculty member must already exist and be in your department."
      onClose={onClose}
    >
      {!summary ? (
        <div className="space-y-4">
          <button type="button" onClick={() => downloadCsv('achievements_import_template.csv', buildAchievementsTemplateCsv())} className="text-xs text-crimson hover:underline">
            Download CSV template →
          </button>

          <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-600 cursor-pointer hover:border-crimson hover:text-crimson transition">
            <Upload className="h-4 w-4 shrink-0" />
            <span className="truncate">{file ? file.name : 'Choose CSV file…'}</span>
            <input type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:text-navy transition">
              Cancel
            </button>
            <button
              type="button"
              disabled={!file || importing}
              onClick={handleImport}
              className="flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 disabled:opacity-50 transition"
            >
              {importing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Import
            </button>
          </div>
        </div>
      ) : (
        <ImportResultSummary
          badges={[
            { label: `${summary.created} created`, tone: 'emerald' },
            { label: `${summary.skipped} skipped (duplicate)`, tone: 'sky' },
            { label: `${summary.errors.length} error(s)`, tone: 'rose' },
          ]}
          errors={summary.errors}
          onReset={() => {
            setSummary(null);
            setFile(null);
          }}
          onClose={onClose}
        />
      )}
    </ImportModalShell>
  );
}

const BADGE_TONE_CLASSES: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
};

function ImportResultSummary({
  badges,
  errors,
  onReset,
  onClose,
}: {
  badges: { label: string; tone: string }[];
  errors: { row: number; email?: string; message: string }[];
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs">
        {badges.map((b) => (
          <span key={b.label} className={cn('rounded-full border px-2.5 py-1 font-semibold', BADGE_TONE_CLASSES[b.tone])}>
            {b.label}
          </span>
        ))}
      </div>
      {errors.length > 0 && (
        <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
          {errors.map((e, idx) => (
            <div key={idx} className="px-3 py-2 text-xs">
              <span className="font-semibold text-slate-700">
                Row {e.row}
                {e.email ? ` (${e.email})` : ''}:{' '}
              </span>
              <span className="text-rose-600">{e.message}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onReset} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:text-navy transition">
          Import another file
        </button>
        <button type="button" onClick={onClose} className="rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 transition">
          Done
        </button>
      </div>
    </div>
  );
}
