import React, { useState } from 'react';
import { X, CheckCircle, Moon, Star, AlertCircle } from 'lucide-react';
import { EndOfDayReview, ScheduledTask } from '../types/nexus';
import { getTodayDateString, formatDateDisplay } from '../utils/dateUtils';

interface EndOfDayReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: ScheduledTask[];
  todayCompletedMins: number;
  todayPlannedMins: number;
  onSaveReview: (review: EndOfDayReview) => void;
}

export const EndOfDayReviewModal: React.FC<EndOfDayReviewModalProps> = ({
  isOpen,
  onClose,
  tasks,
  todayCompletedMins,
  todayPlannedMins,
  onSaveReview,
}) => {
  const today = getTodayDateString();
  const [rating, setRating] = useState<number>(4);
  const [achievements, setAchievements] = useState<string>('');
  const [whatWentWrong, setWhatWentWrong] = useState<string>('');
  const [tomorrowFocus, setTomorrowFocus] = useState<string>('');

  if (!isOpen) return null;

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'postponed');

  const handleSave = () => {
    const review: EndOfDayReview = {
      date: today,
      completed: true,
      rating,
      achievements: achievements.trim() || `Completed ${completedTasks.length} planned academic & programming tasks.`,
      whatWentWrong: whatWentWrong.trim(),
      studySatisfaction: rating,
      tomorrowFocus: tomorrowFocus.trim(),
      completedAt: new Date().toISOString(),
    };
    onSaveReview(review);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-semibold tracking-tight">End-of-Day Review & Blueprint</h2>
              <p className="text-xs text-slate-400">{formatDateDisplay(today)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Planned vs Completed Stats */}
        <div className="my-4 grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Tasks Completed</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
              {completedTasks.length} / {tasks.length}
            </div>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Study Minutes</span>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5 tabular-nums">
              {todayCompletedMins} <span className="text-xs font-normal text-slate-500">/ {todayPlannedMins}m</span>
            </div>
          </div>
        </div>

        {/* Reflection inputs */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Overall Day Discipline & Focus Rating (1-5)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Key Achievements & Topics Covered Today
            </label>
            <textarea
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="e.g. Mastered Matrix Echelon reduction, completed Python conditionals exercises, attended driving class on time."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              What went wrong or caused delays? (Honest friction analysis)
            </label>
            <textarea
              value={whatWentWrong}
              onChange={(e) => setWhatWentWrong(e.target.value)}
              placeholder="e.g. Extended phone scrolling after college commute; felt sleepy during late night BEEE review."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Tomorrow's Single Most Important Academic Objective
            </label>
            <input
              type="text"
              value={tomorrowFocus}
              onChange={(e) => setTomorrowFocus(e.target.value)}
              placeholder="e.g. Solve 5 Eigenvector numerical problems independently before dinner."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {pendingTasks.length > 0 && (
            <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-start gap-2 text-slate-400">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-300 font-medium">Unfinished tasks: </span>
                {pendingTasks.map((t) => t.title).join(', ')}.
                <p className="mt-0.5 text-slate-500">
                  NEXUS scheduling engine will adaptively prioritize these tomorrow without overloading your timetable.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-5 border-t border-slate-800 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete Day Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};
