'use client';

import { useEffect, useState } from 'react';
import {
  getAllCourseAdmissionsDetails,
  type CourseAdmissionsDetails,
} from '@/lib/admissions-details.functions';
import { updateCourseAdmissionsDetails } from '@/lib/admissions-details-next';
import { MediaUploader } from '@/components/admin-next/MediaUploader';
import { toast } from 'sonner';
import { Edit2, Loader2, GraduationCap } from 'lucide-react';

type EditState = {
  id: string;
  intake: string;
  fees_per_semester: string;
  duration: string;
  eligibility: string;
  brochure_file_url: string;
};

function toEditState(course: CourseAdmissionsDetails): EditState {
  return {
    id: course.id,
    intake: course.intake?.toString() ?? '',
    fees_per_semester: course.fees_per_semester ?? '',
    duration: course.duration ?? '',
    eligibility: course.eligibility ?? '',
    brochure_file_url: course.brochure_file_url ?? '',
  };
}

export function AdminAdmissionsDetailsPage() {
  const [courses, setCourses] = useState<CourseAdmissionsDetails[]>([]);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setFetching(true);
    try {
      const data = await getAllCourseAdmissionsDetails();
      setCourses(data);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await updateCourseAdmissionsDetails({
        id: editing.id,
        intake: editing.intake.trim() ? Number(editing.intake) : null,
        fees_per_semester: editing.fees_per_semester.trim() || null,
        duration: editing.duration.trim() || null,
        eligibility: editing.eligibility.trim() || null,
        brochure_file_url: editing.brochure_file_url.trim() || null,
      });
      toast.success('Admissions details updated');
      setEditing(null);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-crimson" />
          Admissions Details
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Intake, fees, duration, eligibility and brochure for each course. Shown on the public
          Admissions pages.
        </p>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold text-navy text-base">
                {courses.find((c) => c.id === editing.id)?.name}
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase">Intake</label>
                <input
                  type="number"
                  value={editing.intake}
                  onChange={(e) => setEditing((p) => ({ ...p!, intake: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase">
                  Fees per Semester
                </label>
                <input
                  type="text"
                  value={editing.fees_per_semester}
                  onChange={(e) =>
                    setEditing((p) => ({ ...p!, fees_per_semester: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase">Duration</label>
                <input
                  type="text"
                  value={editing.duration}
                  onChange={(e) => setEditing((p) => ({ ...p!, duration: e.target.value }))}
                  placeholder="e.g. 4 Years"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase">
                  Eligibility
                </label>
                <textarea
                  rows={3}
                  value={editing.eligibility}
                  onChange={(e) => setEditing((p) => ({ ...p!, eligibility: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase">Brochure</label>
                <MediaUploader
                  type="file"
                  value={editing.brochure_file_url}
                  onChange={(url) => setEditing((p) => ({ ...p!, brochure_file_url: url }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 transition disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-crimson" />
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No courses found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Course
                </th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  College / Department
                </th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Intake
                </th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fees / Sem
                </th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Brochure
                </th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {courses.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                >
                  <td className="p-3 font-semibold text-navy">
                    {c.name}
                    <span className="ml-1.5 text-xs font-normal text-slate-400">{c.code}</span>
                  </td>
                  <td className="p-3 text-slate-500 text-xs">
                    {c.department?.college?.name ?? '—'} / {c.department?.name ?? '—'}
                  </td>
                  <td className="p-3 text-slate-500">{c.intake ?? '—'}</td>
                  <td className="p-3 text-slate-500">{c.fees_per_semester || '—'}</td>
                  <td className="p-3 text-slate-500">{c.duration || '—'}</td>
                  <td className="p-3 text-slate-500">
                    {c.brochure_file_url ? (
                      <a
                        href={c.brochure_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-crimson underline"
                      >
                        View
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => setEditing(toEditState(c))}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy transition"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
