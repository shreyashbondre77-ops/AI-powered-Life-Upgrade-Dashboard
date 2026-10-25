import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Play,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  Flame,
  BatteryMedium,
  RotateCcw,
  BookOpen,
  Terminal,
  Moon,
  ChevronRight,
  MoreVertical,
  Plus,
} from 'lucide-react';
import {
  UserProfile,
  ScheduledTask,
  TimetableBlock,
  Habit,
  EnergyLevel,
  PlanningMode,
  Subject,
} from '../types/nexus';
import {
  formatDateDisplay,
  getTodayDateString,
  getCurrentTimeString,
  formatTime12h,
} from '../utils/dateUtils';

interface TodayViewProps {
  profile: UserProfile;
  tasks: ScheduledTask[];
  timetable: TimetableBlock[];
  habits: Habit[];
  subjects: Subject[];
  todayCompletedMins: number;
  recommendationReason: string;
  onToggleHabit: (habitId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: ScheduledTask['status'], actualMins?: number) => void;
  onPostponeTask: (taskId: string, reason: string) => void;
  onStartFocusOnTask: (task: ScheduledTask) => void;
  onRebuildPlan: () => void;
  onChangeEnergy: (energy: EnergyLevel) => void;
  onChangeMode: (mode: PlanningMode) => void;
  onOpenReviewModal: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  profile,
  tasks,
  timetable,
  habits,
  subjects,
  todayCompletedMins,
  recommendationReason,
  onToggleHabit,
  onUpdateTaskStatus,
  onPostponeTask,
  onStartFocusOnTask,
  onRebuildPlan,
  onChangeEnergy,
  onChangeMode,
  onOpenReviewModal,
}) => {
  const today = getTodayDateString();
  const currentTime = getCurrentTimeString();

  // Postpone dialog state
  const [postponingTaskId, setPostponingTaskId] = useState<string | null>(null);
  const [postponeReason, setPostponeReason] = useState<string>('');

  // Calculate planned study minutes
  const plannedStudyMins = tasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Next scheduled pending task
  const nextTask = tasks.find((t) => t.status === 'pending' || t.status === 'in_progress');

  // Greeting based on current local hour
  const getGreeting = () => {
    const hour = parseInt(currentTime.split(':')[0], 10);
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handlePostponeSubmit = () => {
    if (postponingTaskId) {
      onPostponeTask(postponingTaskId, postponeReason.trim() || 'Schedule adjustment');
      setPostponingTaskId(null);
      setPostponeReason('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* 1. Header & Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/70 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <span>{formatDateDisplay(today)}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{profile.activeDailyMode.replace('_', ' ')} Plan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            {getGreeting()}, {profile.name || 'Engineer'}.
          </h1>
          <p className="text-xs text-slate-400">
            AI&DS 1st Year · Semester Exam readiness in progress
          </p>
        </div>

        {/* Energy & Quick Status Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <span className="px-2 text-slate-400 text-[11px]">Energy:</span>
            {(['low', 'medium', 'high'] as EnergyLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onChangeEnergy(lvl)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                  profile.currentEnergy === lvl
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Early Return Toggle */}
          <button
            onClick={() =>
              onChangeMode(profile.activeDailyMode === 'free_lecture' ? 'normal' : 'free_lecture')
            }
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              profile.activeDailyMode === 'free_lecture'
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 font-semibold'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {profile.activeDailyMode === 'free_lecture' ? 'Early 4PM Active' : 'Free Lecture / Home Early?'}
          </button>
        </div>
      </div>

      {/* 2. Primary Metric Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress Ring / Task Completion */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Task Progress</span>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
              {completedTasks.length} <span className="text-sm font-normal text-slate-400">/ {tasks.length}</span>
            </div>
            <span className="text-[11px] text-emerald-400 mt-0.5 block font-medium">
              {taskCompletionRate}% completed
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center font-mono text-xs font-bold text-indigo-400">
            {taskCompletionRate}%
          </div>
        </div>

        {/* Study Time Planned vs Completed */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block">Study Time Investment</span>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-1 tabular-nums">
            {todayCompletedMins}m <span className="text-sm font-normal text-slate-400">/ {plannedStudyMins}m</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {plannedStudyMins > 0
              ? `${Math.max(0, plannedStudyMins - todayCompletedMins)}m remaining`
              : 'Target achieved'}
          </span>
        </div>

        {/* Mode & Constraint Protection */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block">Protected Blocks</span>
          <div className="text-sm font-bold text-slate-200 mt-1">
            College 10:15–17:15
          </div>
          <span className="text-[11px] text-amber-400 mt-0.5 block font-medium">
            {profile.drivingClass.enabled ? 'Driving 20:00–21:00 Active' : 'No evening transit'}
          </span>
        </div>

        {/* End of Day Review CTA */}
        <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-300 block">Evening Routine</span>
            <p className="text-[11px] text-indigo-400/80 mt-0.5">
              Lock in your achievements and reflect on today’s pace.
            </p>
          </div>
          <button
            onClick={onOpenReviewModal}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
          >
            <span>Complete Day Review</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Next Up Recommendation Banner */}
      {nextTask && (
        <div className="p-4 bg-slate-900 border border-indigo-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/40">
                Recommended Next
              </span>
              <span className="text-xs text-slate-400">{nextTask.estimatedMinutes} mins estimated</span>
            </div>
            <h3 className="text-base font-bold text-slate-100">{nextTask.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              {nextTask.reasonSelected || recommendationReason}
            </p>
          </div>
          <button
            onClick={() => onStartFocusOnTask(nextTask)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 shrink-0 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Focus Session</span>
          </button>
        </div>
      )}

      {/* 4. Split Grid: Today's Tasks & Adaptive Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Actionable Tasks (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Today’s Actionable Study Plan</span>
            </h2>
            <button
              onClick={onRebuildPlan}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rebuild Today</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => {
              const isDone = task.status === 'completed';
              const isPostponed = task.status === 'postponed';

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : isPostponed
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() =>
                        onUpdateTaskStatus(task.id, isDone ? 'pending' : 'completed', task.estimatedMinutes)
                      }
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            isDone ? 'line-through text-slate-500' : 'text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.type === 'python' && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-900/40 rounded">
                            Python
                          </span>
                        )}
                        {task.priority === 'urgent' && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-rose-950 text-rose-300 border border-rose-900/40 rounded">
                            Urgent
                          </span>
                        )}
                      </div>

                      {task.suggestedMethod && !isDone && (
                        <p className="text-[11px] text-slate-400">
                          <span className="text-slate-300 font-medium">Method: </span>
                          {task.suggestedMethod}
                        </p>
                      )}

                      {task.completionCriteria && !isDone && (
                        <p className="text-[11px] text-slate-500">
                          <span className="text-slate-400 font-medium">Done when: </span>
                          {task.completionCriteria}
                        </p>
                      )}

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
                        <span>{task.estimatedMinutes} mins</span>
                        {task.startTime && (
                          <span>
                            {formatTime12h(task.startTime)} - {formatTime12h(task.endTime || '')}
                          </span>
                        )}
                        {task.actualMinutes > 0 && (
                          <span className="text-indigo-400 font-semibold">
                            Logged: {task.actualMinutes}m
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Task Actions */}
                    {!isDone && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onStartFocusOnTask(task)}
                          title="Start focus timer for this task"
                          className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => setPostponingTaskId(task.id)}
                          title="Postpone with reason"
                          className="px-2 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        >
                          Postpone
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Daily Habits & Timetable (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Habits Checklist */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Daily Discipline Checklist</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                {habits.filter((h) => h.history[today]).length} / {habits.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {habits.map((habit) => {
                const isCompleted = Boolean(habit.history[today]);
                return (
                  <button
                    key={habit.id}
                    onClick={() => onToggleHabit(habit.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                      isCompleted
                        ? 'bg-slate-950/50 text-slate-400'
                        : 'bg-slate-950 text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <span className={isCompleted ? 'line-through text-slate-500' : ''}>
                      {habit.title}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timetable Flow (Chronological Blocks) */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Today's Time Block Sequence</span>
              </h2>
            </div>

            <div className="space-y-2">
              {timetable.map((block) => {
                const isFixed = block.isFixed;
                const isCurrent =
                  currentTime >= block.startTime && currentTime <= block.endTime;

                let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
                if (block.type === 'college') badgeColor = 'bg-blue-950/60 text-blue-300 border-blue-900/40';
                if (block.type === 'commute') badgeColor = 'bg-slate-950 text-slate-400 border-slate-800';
                if (block.type === 'driving_class') badgeColor = 'bg-amber-950/60 text-amber-300 border-amber-900/40';
                if (block.type === 'study') badgeColor = 'bg-indigo-950/60 text-indigo-300 border-indigo-900/40';
                if (block.type === 'python') badgeColor = 'bg-emerald-950/60 text-emerald-300 border-emerald-900/40';

                return (
                  <div
                    key={block.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                      isCurrent ? 'ring-1 ring-indigo-500 bg-slate-900' : 'bg-slate-950/80 border-slate-800/80'
                    }`}
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 truncate">{block.title}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">
                            Now
                          </span>
                        )}
                      </div>
                      {block.notes && <p className="text-[10px] text-slate-500 truncate">{block.notes}</p>}
                    </div>

                    <div className="shrink-0 font-mono text-[11px] text-slate-400 tabular-nums">
                      {formatTime12h(block.startTime)} - {formatTime12h(block.endTime)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Postpone Reason Modal */}
      {postponingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100">
              Record Reason for Postponing
            </h3>
            <p className="text-xs text-slate-400">
              NEXUS uses this honest data to adjust future task duration estimates and avoid overload.
            </p>
            <textarea
              value={postponeReason}
              onChange={(e) => setPostponeReason(e.target.value)}
              placeholder="e.g. Unexpected college assignment delay, high fatigue after driving class."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPostponingTaskId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handlePostponeSubmit}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md"
              >
                Confirm Postpone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
