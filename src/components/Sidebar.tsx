import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  Terminal,
  CheckSquare,
  BarChart3,
  Settings as SettingsIcon,
  Car,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile, PlanningMode } from '../types/nexus';
import { daysBetween, getTodayDateString } from '../utils/dateUtils';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  profile: UserProfile;
  onChangeMode: (mode: PlanningMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  profile,
  onChangeMode,
}) => {
  const today = getTodayDateString();
  const navItems = [
    { id: 'today', label: 'Today', icon: LayoutDashboard },
    { id: 'planner', label: 'Planner', icon: CalendarDays },
    { id: 'engineering', label: 'Engineering', icon: GraduationCap },
    { id: 'python', label: 'Python Path', icon: Terminal },
    { id: 'goals', label: 'Goals & Habits', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Calculate days to exam
  const daysToExam = profile.nextExamStartDate ? daysBetween(today, profile.nextExamStartDate) : 21;

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-800 bg-slate-950 transition-all duration-200 z-20 shrink-0 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Navigation Links */}
        <div className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Status Panels (Only when expanded) */}
        {!collapsed && (
          <div className="p-3 border-t border-slate-800/80 space-y-2.5 text-xs">
            {/* Active Mode Selector */}
            <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="font-medium text-slate-300">Active Mode</span>
                <span className="capitalize text-indigo-400 font-semibold">
                  {profile.activeDailyMode.replace('_', ' ')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <button
                  onClick={() => onChangeMode('normal')}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium text-center transition-colors ${
                    profile.activeDailyMode === 'normal'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => onChangeMode('free_lecture')}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium text-center transition-colors ${
                    profile.activeDailyMode === 'free_lecture'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Early 4 PM
                </button>
                <button
                  onClick={() => onChangeMode('exam_prep')}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium text-center transition-colors ${
                    profile.activeDailyMode === 'exam_prep'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Exam Prep
                </button>
                <button
                  onClick={() => onChangeMode('recovery')}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium text-center transition-colors ${
                    profile.activeDailyMode === 'recovery'
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Recovery
                </button>
              </div>
            </div>

            {/* Driving Class Reminder */}
            {profile.drivingClass.enabled && (
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-2 flex items-start gap-2">
                <Car className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <div className="font-medium text-amber-300 text-[11px]">Driving Class Active</div>
                  <div className="text-[10px] text-amber-400/80 mt-0.5">
                    {profile.drivingClass.startTime} - {profile.drivingClass.endTime} · Ends {profile.drivingClass.endDate}
                  </div>
                </div>
              </div>
            )}

            {/* Exam Countdown */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px]">Exam Period</span>
              </div>
              <span className="font-mono text-[11px] text-indigo-300 font-semibold tabular-nums">
                {daysToExam > 0 ? `${daysToExam}d away` : 'Active'}
              </span>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-md transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-slate-950 border-t border-slate-800 flex items-center justify-around z-30 px-2">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-md ${
                isActive ? 'text-indigo-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onSelectView('analytics')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-md ${
            currentView === 'analytics' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Stats</span>
        </button>
        <button
          onClick={() => onSelectView('settings')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-md ${
            currentView === 'settings' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Config</span>
        </button>
      </nav>
    </>
  );
};
