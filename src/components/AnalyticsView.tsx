import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  Layers,
  Flame,
  Award,
  RefreshCw,
} from 'lucide-react';
import {
  NexusAppState,
  WeeklyReviewReport,
  StudySession,
  ScheduledTask,
  Subject,
} from '../types/nexus';
import { getWeekDates, getTodayDateString, getDayName, formatDateDisplay } from '../utils/dateUtils';

interface AnalyticsViewProps {
  state: NexusAppState;
  onGenerateAIReview: () => Promise<WeeklyReviewReport | null>;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ state, onGenerateAIReview }) => {
  const [isGeneratingReview, setIsGeneratingReview] = useState<boolean>(false);
  const [selectedReportIndex, setSelectedReportIndex] = useState<number>(0);
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7);

  const today = getTodayDateString();
  const weekDates = getWeekDates(today);

  // Filter study sessions by date range
  const sessions = state.sessions || [];
  const tasks = state.tasks || [];
  const subjects = state.subjects || [];

  const totalCompletedMins = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalFocusSessions = sessions.length;
  const avgSessionDuration =
    totalFocusSessions > 0 ? Math.round(totalCompletedMins / totalFocusSessions) : 0;

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Calculate subject-wise minutes
  const subjectMinsMap: Record<string, number> = {};
  subjects.forEach((s) => {
    subjectMinsMap[s.name] = 0;
  });
  sessions.forEach((s) => {
    if (s.subjectName) {
      subjectMinsMap[s.subjectName] = (subjectMinsMap[s.subjectName] || 0) + s.durationMinutes;
    }
  });

  // Calculate day-wise planned vs actual for current week
  const weekActivity = weekDates.map((dateStr) => {
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    const daySessions = sessions.filter((s) => s.date === dateStr);
    const plannedMins = dayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
    const actualMins = daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const completedCount = dayTasks.filter((t) => t.status === 'completed').length;

    return {
      date: dateStr,
      dayName: getDayName(dateStr).slice(0, 3),
      plannedMins,
      actualMins,
      completedCount,
      totalCount: dayTasks.length,
    };
  });

  const activeReport: WeeklyReviewReport | undefined =
    state.weeklyReports[selectedReportIndex] || state.weeklyReports[0];

  const handleRunAIAdvisor = async () => {
    setIsGeneratingReview(true);
    try {
      await onGenerateAIReview();
    } finally {
      setIsGeneratingReview(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* 1. Analytics Header */}
      <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Productivity Analytics & Weekly Audit</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grounded entirely in your actual logged timer records and completed habits. No fabricated metrics.
          </p>
        </div>

        <button
          onClick={handleRunAIAdvisor}
          disabled={isGeneratingReview}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
        >
          {isGeneratingReview ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Logged Records...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate AI Weekly Review</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 block">Total Focus Time</span>
          <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
            {totalCompletedMins} <span className="text-sm font-normal text-slate-500">mins</span>
          </div>
          <span className="text-[11px] text-slate-500 block">Across verified timer sessions</span>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 block">Task Completion Rate</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {taskCompletionRate}%
          </div>
          <span className="text-[11px] text-slate-500 block">
            {completedTasks.length} of {tasks.length} tasks executed
          </span>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 block">Focus Sessions</span>
          <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {totalFocusSessions}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Avg {avgSessionDuration}m per session
          </span>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 block">Active Habits</span>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {state.habits.length}
          </div>
          <span className="text-[11px] text-slate-500 block">Daily discipline actions</span>
        </div>
      </div>

      {/* 3. Planned vs Actual Weekly Activity Bar Chart */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Weekly Planned vs Actual Study Time (Minutes)</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Visualizes whether you are over-scheduling or meeting your daily study targets.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-slate-700 rounded-sm" />
              <span className="text-slate-400">Planned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-indigo-500 rounded-sm" />
              <span className="text-indigo-300 font-semibold">Actual Completed</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Columns */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 border-t border-slate-800/80">
          {weekActivity.map((day) => {
            const maxMins = 180; // Baseline height scale
            const plannedHeight = Math.min(100, Math.round((day.plannedMins / maxMins) * 100));
            const actualHeight = Math.min(100, Math.round((day.actualMins / maxMins) * 100));

            return (
              <div key={day.date} className="flex flex-col items-center gap-2 text-center">
                <div className="h-36 w-full bg-slate-950 rounded-lg p-1.5 flex items-end justify-center gap-1.5 border border-slate-850">
                  {/* Planned Bar */}
                  <div
                    className="w-3 sm:w-4 bg-slate-700/80 rounded-t transition-all"
                    style={{ height: `${Math.max(4, plannedHeight)}%` }}
                    title={`Planned: ${day.plannedMins}m`}
                  />
                  {/* Actual Bar */}
                  <div
                    className="w-3 sm:w-4 bg-indigo-500 rounded-t transition-all shadow-sm shadow-indigo-500/20"
                    style={{ height: `${Math.max(4, actualHeight)}%` }}
                    title={`Actual: ${day.actualMins}m`}
                  />
                </div>

                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200 block text-[11px]">{day.dayName}</span>
                  <span className="font-mono text-[10px] text-slate-500 block tabular-nums">
                    {day.actualMins}m
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Subject Study Time Distribution */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>5 Engineering Subjects Time Investment Distribution</span>
        </h2>

        <div className="space-y-3">
          {Object.entries(subjectMinsMap).map(([subName, mins]) => {
            const pct = totalCompletedMins > 0 ? Math.round((mins / totalCompletedMins) * 100) : 0;
            const isZero = mins === 0;

            return (
              <div key={subName} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{subName}</span>
                    {isZero && (
                      <span className="text-[10px] text-amber-400 font-mono font-medium">
                        (Needs Attention)
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-slate-300 font-bold tabular-nums">
                    {mins}m ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isZero ? 'bg-amber-600/30' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Comprehensive Weekly AI & Analytical Review (7 Questions) */}
      {activeReport && (
        <div className="p-6 bg-slate-900 border border-indigo-500/30 rounded-2xl space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/40 uppercase">
                  {activeReport.source === 'ai' ? 'Gemini 3.8 Flash Audit' : 'Analytical Rule Audit'}
                </span>
                <span className="text-slate-400">{activeReport.weekLabel}</span>
              </div>
              <h2 className="text-base font-bold text-slate-100 mt-1">
                7-Point Weekly Academic & Habit Review
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Audit Date: {formatDateDisplay(today)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 block">1. What went well this week?</span>
              <p className="text-slate-300 leading-relaxed">{activeReport.q1_what_went_well}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-amber-400 block">2. What did I repeatedly postpone?</span>
              <p className="text-slate-300 leading-relaxed">{activeReport.q2_repeatedly_postponed}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-rose-400 block">3. Which subjects received too little attention?</span>
              <p className="text-slate-300 leading-relaxed">{activeReport.q3_neglected_subjects}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-indigo-400 block">4. Am I estimating my study time accurately?</span>
              <p className="text-slate-300 leading-relaxed">{activeReport.q4_estimation_accuracy}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-400 block">5. Which habits are improving or declining?</span>
              <p className="text-slate-300 leading-relaxed">{activeReport.q5_habits_trend}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-purple-400 block">6. What is the biggest obstacle to my goals?</span>
              <p className="text-slate-300 leading-relaxed">{activeReport.q6_biggest_obstacle}</p>
            </div>
          </div>

          <div className="p-4 bg-indigo-950/30 border border-indigo-900/50 rounded-xl space-y-1.5">
            <span className="font-bold text-indigo-300 block text-sm">
              7. Three Realistic Changes for Next Week:
            </span>
            <p className="text-indigo-100 font-medium leading-relaxed">
              {activeReport.q7_three_changes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
