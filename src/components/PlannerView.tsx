import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Zap,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import {
  UserProfile,
  ScheduledTask,
  TimetableBlock,
  PlanningMode,
  TargetPace,
  Subject,
} from '../types/nexus';
import {
  formatDateDisplay,
  getTodayDateString,
  formatTime12h,
  getDayName,
  getWeekDates,
} from '../utils/dateUtils';

interface PlannerViewProps {
  profile: UserProfile;
  tasks: ScheduledTask[];
  timetable: TimetableBlock[];
  subjects: Subject[];
  onChangeMode: (mode: PlanningMode) => void;
  onChangePace: (pace: TargetPace) => void;
  onAddTask: (task: ScheduledTask) => void;
  onDeleteTask: (taskId: string) => void;
  onReplan: () => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  profile,
  tasks,
  timetable,
  subjects,
  onChangeMode,
  onChangePace,
  onAddTask,
  onDeleteTask,
  onReplan,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New task form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || '');
  const [newPriority, setNewPriority] = useState<ScheduledTask['priority']>('medium');
  const [newMinutes, setNewMinutes] = useState<number>(45);
  const [newStartTime, setNewStartTime] = useState<string>('19:00');

  const weekDates = getWeekDates(selectedDate);
  const filteredTasks = tasks.filter((t) => t.date === selectedDate);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const selectedSub = subjects.find((s) => s.id === newSubjectId);
    const newTask: ScheduledTask = {
      id: `task_custom_${Date.now()}`,
      date: selectedDate,
      title: newTitle.trim(),
      subjectId: selectedSub?.id,
      subjectName: selectedSub?.name,
      type: 'engineering',
      priority: newPriority,
      estimatedMinutes: newMinutes,
      actualMinutes: 0,
      status: 'pending',
      startTime: newStartTime,
    };

    onAddTask(newTask);
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* 1. Header & Planning Controls */}
      <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            <span>Adaptive Timetable & Calendar</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Rule-based scheduling engine protecting college hours (10:15–17:15) and transit.
          </p>
        </div>

        {/* Pace & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <span className="px-2 text-slate-400 text-[11px]">Daily Target:</span>
            {(['minimum', 'target', 'stretch'] as TargetPace[]).map((pace) => (
              <button
                key={pace}
                onClick={() => onChangePace(pace)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                  profile.targetPace === pace
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {pace}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* 2. Mode Strategy Switcher Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {[
          { id: 'normal', label: 'Normal College', desc: 'Balanced 5 subjects + Python' },
          { id: 'free_lecture', label: 'Early 4:00 PM', desc: 'Free lecture bonus study' },
          { id: 'exam_prep', label: 'Exam Prep (21d)', desc: 'High active recall & PYQ' },
          { id: 'exam_day', label: 'Exam Day', desc: 'Light revision & readiness' },
          { id: 'recovery', label: 'Recovery Mode', desc: 'Minimum essential rest' },
        ].map((m) => {
          const isActive = profile.activeDailyMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChangeMode(m.id as PlanningMode)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-200">{m.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{m.desc}</div>
            </button>
          );
        })}
      </div>

      {/* 3. Week Date Selector Ribbon */}
      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          {weekDates.map((dateStr) => {
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === getTodayDateString();
            const dayName = getDayName(dateStr).slice(0, 3);
            const dayNum = dateStr.split('-')[2];

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`py-2 px-3 rounded-lg text-center transition-all shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/20'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] uppercase font-mono block opacity-80">{dayName}</span>
                <span className="text-sm font-bold block">{dayNum}</span>
                {isToday && (
                  <span className="text-[9px] block text-indigo-300 font-semibold leading-none">
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-mono text-slate-400 shrink-0 hidden sm:block">
          {formatDateDisplay(selectedDate)}
        </div>
      </div>

      {/* 4. Day Schedule Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chronological Timetable Sequence (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Time Blocks for {formatDateDisplay(selectedDate)}</span>
          </h2>

          <div className="space-y-2">
            {timetable.map((block) => {
              let blockBorder = 'border-slate-800 bg-slate-950/80';
              let titleColor = 'text-slate-200';

              if (block.type === 'college') {
                blockBorder = 'border-blue-900/40 bg-blue-950/20';
                titleColor = 'text-blue-200';
              } else if (block.type === 'driving_class') {
                blockBorder = 'border-amber-900/40 bg-amber-950/20';
                titleColor = 'text-amber-200';
              } else if (block.type === 'study') {
                blockBorder = 'border-indigo-900/40 bg-indigo-950/20';
                titleColor = 'text-indigo-200';
              } else if (block.type === 'python') {
                blockBorder = 'border-emerald-900/40 bg-emerald-950/20';
                titleColor = 'text-emerald-200';
              }

              return (
                <div
                  key={block.id}
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${blockBorder}`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${titleColor}`}>{block.title}</span>
                      {block.isFixed && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                          Fixed Commit
                        </span>
                      )}
                    </div>
                    {block.notes && <p className="text-[11px] text-slate-400">{block.notes}</p>}
                  </div>

                  <div className="shrink-0 font-mono text-xs text-slate-300 font-semibold tabular-nums">
                    {formatTime12h(block.startTime)} - {formatTime12h(block.endTime)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Scheduled Study Tasks on Selected Date (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Assigned Study Tasks</span>
            </h2>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {filteredTasks.length} tasks
            </span>
          </div>

          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-xs">
                No specific custom tasks logged for this date.
              </div>
            ) : (
              filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-200">{t.title}</span>
                    <button
                      onClick={() => onDeleteTask(t.id)}
                      className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>{t.estimatedMinutes} mins</span>
                    {t.startTime && <span>Starts: {formatTime12h(t.startTime)}</span>}
                    <span className="capitalize text-indigo-400 font-medium">{t.priority}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateTask}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-slate-100">Add Study / Assignment Task</h3>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Task Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Solve 5 Eigenvector numerical problems"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject</label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  min={10}
                  max={180}
                  value={newMinutes}
                  onChange={(e) => setNewMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
