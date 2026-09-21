'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';

export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw new Error(updateErr.message);

      toast.success('Password changed.');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/80 p-4 z-50 overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-black/30">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-navy">
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-display text-xl font-bold text-navy mb-4">Change Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded border border-slate-200 bg-white px-3 py-2 pr-9 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-crimson/30"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Confirm New Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-crimson/30"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-crimson px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson/90 transition disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
