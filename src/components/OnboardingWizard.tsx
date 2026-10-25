import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  GraduationCap,
  Calendar,
  Terminal,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { UserProfile, Subject } from '../types/nexus';
import { DEFAULT_AIDS_SUBJECTS } from '../data/defaultSyllabus';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  subjects: Subject[];
  onComplete: (updatedProfile: UserProfile, updatedSubjects: Subject[]) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  profile,
  subjects,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [formProfile, setFormProfile] = useState<UserProfile>({ ...profile });
  const [formSubjects, setFormSubjects] = useState<Subject[]>(
    subjects.length === 5 ? [...subjects] : [...DEFAULT_AIDS_SUBJECTS]
  );

  if (!isOpen) return null;

  const handleSubjectChange = (index: number, field: keyof Subject, value: any) => {
    setFormSubjects((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleFinish = () => {
    const finalProfile: UserProfile = {
      ...formProfile,
      onboardingCompleted: true,
    };
    onComplete(finalProfile, formSubjects);
    onClose();
  };

  const handleLoadAidSTemplate = () => {
    setFormSubjects([...DEFAULT_AIDS_SUBJECTS]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase tracking-wider block">
              Step {step} of 4 · Setup Wizard
            </span>
            <h2 className="text-lg font-bold tracking-tight text-slate-100">
              {step === 1 && 'A. Daily Routine & Fixed Commitments'}
              {step === 2 && 'B. Your Five Engineering Subjects'}
              {step === 3 && 'C. Upcoming Examination Schedule'}
              {step === 4 && 'D. Python & Career Milestones'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 text-xs">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Configure your verified daily transit, college timings, and sleep limits so NEXUS never schedules unrealistic study blocks inside college or commute hours.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200 block text-xs">Sleep & Wake Routine</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Wake Up</label>
                      <input
                        type="time"
                        value={formProfile.wakeTime}
                        onChange={(e) => setFormProfile({ ...formProfile, wakeTime: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Bedtime</label>
                      <input
                        type="time"
                        value={formProfile.sleepTime}
                        onChange={(e) => setFormProfile({ ...formProfile, sleepTime: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200 block text-xs">College Timings</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">College Start</label>
                      <input
                        type="time"
                        value={formProfile.collegeStartTime}
                        onChange={(e) => setFormProfile({ ...formProfile, collegeStartTime: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">College End</label>
                      <input
                        type="time"
                        value={formProfile.collegeEndTime}
                        onChange={(e) => setFormProfile({ ...formProfile, collegeEndTime: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-200 block text-xs">Commute / Transit Windows</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Leave Home</label>
                      <input
                        type="time"
                        value={formProfile.leaveHomeTime}
                        onChange={(e) => setFormProfile({ ...formProfile, leaveHomeTime: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Reach Home (Normal)</label>
                      <input
                        type="time"
                        value={formProfile.normalReachHomeTime}
                        onChange={(e) => setFormProfile({ ...formProfile, normalReachHomeTime: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Temporary Driving Class */}
                <div className="p-3 bg-slate-950 rounded-lg border border-amber-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-300 block text-xs">
                      Temporary Driving Class (20 Days)
                    </span>
                    <input
                      type="checkbox"
                      checked={formProfile.drivingClass.enabled}
                      onChange={(e) =>
                        setFormProfile({
                          ...formProfile,
                          drivingClass: { ...formProfile.drivingClass, enabled: e.target.checked },
                        })
                      }
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="text-slate-400 block mb-1">Class Hours</label>
                      <div className="font-mono text-slate-300">
                        {formProfile.drivingClass.startTime} - {formProfile.drivingClass.endTime}
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">End Date</label>
                      <input
                        type="date"
                        value={formProfile.drivingClass.endDate}
                        onChange={(e) =>
                          setFormProfile({
                            ...formProfile,
                            drivingClass: { ...formProfile.drivingClass, endDate: e.target.value },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-300">
                  Enter your 5 exact engineering subjects. You can type custom names or start with the standard AI&DS 1st-year curriculum.
                </p>
                <button
                  type="button"
                  onClick={handleLoadAidSTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-800/40 rounded text-xs transition-colors shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load AI&DS Template</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {formSubjects.map((sub, idx) => (
                  <div
                    key={sub.id || idx}
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1 w-full space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={sub.name}
                          onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                          placeholder="Subject Name (e.g. Engineering Mathematics I)"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-medium focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          value={sub.code}
                          onChange={(e) => handleSubjectChange(idx, 'code', e.target.value)}
                          placeholder="Code"
                          className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 font-mono text-center"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-slate-400">
                      <div>
                        <span className="text-[10px] block text-slate-500">Difficulty</span>
                        <select
                          value={sub.difficulty}
                          onChange={(e) => handleSubjectChange(idx, 'difficulty', Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 text-xs"
                        >
                          <option value={1}>1 (Easy)</option>
                          <option value={2}>2</option>
                          <option value={3}>3 (Med)</option>
                          <option value={4}>4</option>
                          <option value={5}>5 (Hard)</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] block text-slate-500">Confidence</span>
                        <select
                          value={sub.confidence}
                          onChange={(e) => handleSubjectChange(idx, 'confidence', Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 text-xs"
                        >
                          <option value={1}>1 ★</option>
                          <option value={2}>2 ★★</option>
                          <option value={3}>3 ★★★</option>
                          <option value={4}>4 ★★★★</option>
                          <option value={5}>5 ★★★★★</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Set your expected semester exam window. The adaptive engine activates Exam Preparation Mode 21 days prior, prioritizing low-confidence topics, mock problem sets, and formula derivation drills.
              </p>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Expected Exam Start Date (Provisional)
                    </label>
                    <input
                      type="date"
                      value={formProfile.nextExamStartDate}
                      onChange={(e) => setFormProfile({ ...formProfile, nextExamStartDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono text-xs"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Editable anytime when your official university timetable is published.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Exam Prep Window (Days)
                    </label>
                    <input
                      type="number"
                      value={formProfile.examPrepWindowDays}
                      onChange={(e) => setFormProfile({ ...formProfile, examPrepWindowDays: Number(e.target.value) })}
                      min={7}
                      max={60}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono text-xs"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Initial default is 21 days before first paper.
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject wise exam dates */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-300 block text-xs">
                  Subject Exam Dates (when available)
                </span>
                <div className="space-y-1.5">
                  {formSubjects.map((sub, idx) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-2 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs"
                    >
                      <span className="font-medium text-slate-200 truncate pr-2">
                        {sub.name}
                      </span>
                      <input
                        type="date"
                        value={sub.examDate || ''}
                        onChange={(e) => handleSubjectChange(idx, 'examDate', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 font-mono text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Your career goal is to become an AI developer and build production software. Configure your daily Python target and practice preferences.
              </p>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Daily Python Practice Target (Minutes)
                  </label>
                  <div className="flex items-center gap-3">
                    {[25, 35, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setFormProfile({ ...formProfile, pythonDailyMinutesTarget: mins })}
                        className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
                          formProfile.pythonDailyMinutesTarget === mins
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {mins} minutes
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-lg text-xs text-indigo-200">
                  <div className="font-semibold text-indigo-100 mb-1">AI Developer Roadmap:</div>
                  Includes 13 structured milestone modules: Core Syntax → OOP → Git/GitHub → APIs → SQL → DSA → Data Analysis (NumPy/Pandas) → Machine Learning & AI Applications.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Save & Finish Later
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Build My NEXUS OS</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
