import React, { useRef, useState } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  Clock,
  Car,
  Calendar,
  ShieldAlert,
  Sparkles,
  Save,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { UserProfile, NexusAppState, Subject } from '../types/nexus';
import { exportStudyLogsCSV, exportFullBackupJSON, downloadFile, getInitialDefaultState } from '../utils/storage';

interface SettingsViewProps {
  state: NexusAppState;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onUpdateSubjects: (updatedSubjects: Subject[]) => void;
  onRestoreState: (importedState: NexusAppState) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateProfile,
  onUpdateSubjects,
  onRestoreState,
}) => {
  const [profileForm, setProfileForm] = useState<UserProfile>({ ...state.profile });
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportCSV = () => {
    const csv = exportStudyLogsCSV(state);
    downloadFile(csv, `nexus_study_logs_${state.profile.name.toLowerCase()}_2026.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const json = exportFullBackupJSON(state);
    downloadFile(json, `nexus_os_backup_${Date.now()}.json`, 'application/json');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile && parsed.subjects) {
          onRestoreState(parsed);
          alert('System state imported successfully!');
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToClean = () => {
    if (window.confirm('Reset all NEXUS Daily OS data to clean default schedule?')) {
      const fresh = getInitialDefaultState();
      onRestoreState(fresh);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fadeIn text-xs">
      {/* Header */}
      <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-indigo-400" />
            <span>System Configuration & Routine</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Personalize your verified schedule, college transit, driving course term, and exam deadlines.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-900/40 rounded-lg font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* 1. Student Profile & Timezone */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200">1. Student Profile & Local Timezone</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Your Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Engineering Branch</label>
              <input
                type="text"
                value={profileForm.branch}
                onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Timezone (Fixed)</label>
              <input
                type="text"
                disabled
                value={profileForm.timezone}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2 text-slate-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 2. College & Transit Routine */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>2. College & Commute Routine (Protected Blocks)</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Leave Home Time</label>
              <input
                type="time"
                value={profileForm.leaveHomeTime}
                onChange={(e) => setProfileForm({ ...profileForm, leaveHomeTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">College Starts</label>
              <input
                type="time"
                value={profileForm.collegeStartTime}
                onChange={(e) => setProfileForm({ ...profileForm, collegeStartTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">College Finishes</label>
              <input
                type="time"
                value={profileForm.collegeEndTime}
                onChange={(e) => setProfileForm({ ...profileForm, collegeEndTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Normal Arrival Home</label>
              <input
                type="time"
                value={profileForm.normalReachHomeTime}
                onChange={(e) => setProfileForm({ ...profileForm, normalReachHomeTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-slate-400 mb-1">Early Return Time (Free Lecture)</label>
              <input
                type="time"
                value={profileForm.earlyReachHomeTime}
                onChange={(e) => setProfileForm({ ...profileForm, earlyReachHomeTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Usual Wake Time</label>
              <input
                type="time"
                value={profileForm.wakeTime}
                onChange={(e) => setProfileForm({ ...profileForm, wakeTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Target Bedtime</label>
              <input
                type="time"
                value={profileForm.sleepTime}
                onChange={(e) => setProfileForm({ ...profileForm, sleepTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 3. Temporary Driving Class */}
        <div className="p-5 bg-slate-900/60 border border-amber-900/30 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-400" />
              <span>3. Temporary Driving Class (Configurable Term)</span>
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-slate-400 text-xs">Active Event:</span>
              <input
                type="checkbox"
                checked={profileForm.drivingClass.enabled}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    drivingClass: { ...profileForm.drivingClass, enabled: e.target.checked },
                  })
                }
                className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Class Start Time</label>
              <input
                type="time"
                value={profileForm.drivingClass.startTime}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    drivingClass: { ...profileForm.drivingClass, startTime: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Class End Time</label>
              <input
                type="time"
                value={profileForm.drivingClass.endTime}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    drivingClass: { ...profileForm.drivingClass, endTime: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Term Start Date</label>
              <input
                type="date"
                value={profileForm.drivingClass.startDate}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    drivingClass: { ...profileForm.drivingClass, startDate: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Term End Date (~20 Days)</label>
              <input
                type="date"
                value={profileForm.drivingClass.endDate}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    drivingClass: { ...profileForm.drivingClass, endDate: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. Examination Window */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>4. Examination Window & Prep Rules</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">
                Semester Exam Expected Start Date (Provisional)
              </label>
              <input
                type="date"
                value={profileForm.nextExamStartDate}
                onChange={(e) => setProfileForm({ ...profileForm, nextExamStartDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">
                Exam Prep Activation Window (Days Prior)
              </label>
              <input
                type="number"
                min={7}
                max={60}
                value={profileForm.examPrepWindowDays}
                onChange={(e) => setProfileForm({ ...profileForm, examPrepWindowDays: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Profile Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* 5. Data Management, Export & Backup */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
        <h2 className="text-sm font-bold text-slate-200">5. Data Persistence, Backup & Export</h2>
        <p className="text-slate-400">
          Your data is stored locally in the application's persistent database. You can export complete backups anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Study Logs (CSV)</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Full Backup (JSON)</span>
          </button>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Restore Backup (JSON)</span>
          </button>

          <button
            onClick={handleResetToClean}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-900/40 rounded-lg font-semibold transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Clean State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
