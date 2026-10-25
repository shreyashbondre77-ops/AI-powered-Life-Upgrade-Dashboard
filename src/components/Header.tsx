import React from 'react';
import { Play, Flame, Calendar, Clock, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/nexus';
import { formatDateDisplay, getTodayDateString } from '../utils/dateUtils';

interface HeaderProps {
  profile: UserProfile;
  currentView: string;
  onOpenTimer: () => void;
  onOpenOnboarding: () => void;
  onQuickPlanRebuild: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentView,
  onOpenTimer,
  onOpenOnboarding,
  onQuickPlanRebuild,
}) => {
  const todayStr = getTodayDateString();

  const getViewTitle = () => {
    switch (currentView) {
      case 'today':
        return 'Daily Command Center';
      case 'planner':
        return 'Adaptive Timetable & Calendar';
      case 'engineering':
        return '5 Engineering Subjects & Syllabus';
      case 'python':
        return 'Python & AI Developer Path';
      case 'goals':
        return 'Goals, Milestones & Habits';
      case 'analytics':
        return 'Productivity Analytics & Review';
      case 'settings':
        return 'System Configuration & Routine';
      default:
        return 'Operating System';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Zone 1: Brand title & Context */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-500/20">
            N
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold text-slate-100 tracking-tight block leading-none">
              NEXUS Daily OS
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              AI&DS Engineering · 1st Year
            </span>
          </div>
        </div>

        <span className="hidden md:inline-block text-slate-700">/</span>

        <span className="hidden md:inline-block text-sm font-medium text-slate-300">
          {getViewTitle()}
        </span>
      </div>

      {/* Zone 2: Date & Mode Info */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-200 font-medium">{formatDateDisplay(todayStr)}</span>
        </div>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>College: 10:15 - 17:15</span>
        </div>
        {profile.drivingClass.enabled && (
          <>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-amber-400 font-medium">Driving: 20:00 - 21:00</span>
          </>
        )}
      </div>

      {/* Zone 3: Primary Action & Quick Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onQuickPlanRebuild}
          title="Recalculate today's schedule based on current time & mode"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-md transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Rebuild Today</span>
        </button>

        <button
          onClick={onOpenTimer}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-all shadow-sm shadow-indigo-600/30"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start Focus</span>
        </button>

        <button
          onClick={onOpenOnboarding}
          title="Profile & Routine Settings"
          className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-indigo-300 hover:border-indigo-500 transition-colors"
        >
          {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
        </button>
      </div>
    </header>
  );
};
