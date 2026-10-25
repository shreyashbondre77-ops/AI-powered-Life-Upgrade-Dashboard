import React, { useState } from 'react';
import {
  Target,
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Award,
  TrendingUp,
} from 'lucide-react';
import { Goal, Habit } from '../types/nexus';
import { getWeekDates, getTodayDateString, getDayName } from '../utils/dateUtils';

interface GoalsHabitsViewProps {
  goals: Goal[];
  habits: Habit[];
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onAddGoal: (newGoal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onToggleHabitDate: (habitId: string, date: string) => void;
  onAddHabit: (newHabit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const GoalsHabitsView: React.FC<GoalsHabitsViewProps> = ({
  goals,
  habits,
  onToggleMilestone,
  onAddGoal,
  onDeleteGoal,
  onToggleHabitDate,
  onAddHabit,
  onDeleteHabit,
}) => {
  const today = getTodayDateString();
  const weekDates = getWeekDates(today);

  // Goal Modal state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [goalTitle, setGoalTitle] = useState<string>('');
  const [goalDesc, setGoalDesc] = useState<string>('');
  const [goalLevel, setGoalLevel] = useState<'long_term' | 'short_term'>('long_term');
  const [goalDeadline, setGoalDeadline] = useState<string>('2026-11-16');

  // Habit Modal state
  const [isHabitModalOpen, setIsHabitModalOpen] = useState<boolean>(false);
  const [habitTitle, setHabitTitle] = useState<string>('');
  const [habitCategory, setHabitCategory] = useState<Habit['category']>('study');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      title: goalTitle.trim(),
      description: goalDesc.trim(),
      level: goalLevel,
      deadline: goalDeadline,
      priority: 'high',
      progress: 0,
      milestones: [
        { id: `m_${Date.now()}_1`, title: 'Define preparation scope and study plan', completed: false },
        { id: `m_${Date.now()}_2`, title: 'Complete first 50% of practice objectives', completed: false },
      ],
    };

    onAddGoal(newGoal);
    setGoalTitle('');
    setGoalDesc('');
    setIsGoalModalOpen(false);
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;

    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      title: habitTitle.trim(),
      description: 'Daily consistency action.',
      category: habitCategory,
      targetDaily: true,
      history: {},
    };

    onAddHabit(newHabit);
    setHabitTitle('');
    setIsHabitModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* 1. Header */}
      <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" />
            <span>Goals, Milestones & Habits</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sustainable consistency over motivational pressure. 3 connected levels linking your daily actions to your AI developer career.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHabitModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Habit</span>
          </button>
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* 2. Three Levels of Goals */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold tracking-tight text-slate-200 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" />
          <span>Strategic Academic & Career Goals</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => {
            const completedCount = g.milestones.filter((m) => m.completed).length;
            const progress =
              g.milestones.length > 0 ? Math.round((completedCount / g.milestones.length) * 100) : g.progress;

            return (
              <div
                key={g.id}
                className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between text-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-900/40 uppercase">
                      {g.level.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => onDeleteGoal(g.id)}
                      className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100">{g.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{g.description}</p>
                </div>

                {/* Milestones Checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Progress: {progress}%</span>
                    <span>Deadline: {g.deadline}</span>
                  </div>

                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {g.milestones.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => onToggleMilestone(g.id, m.id)}
                        className={`w-full flex items-start gap-2 text-left p-1 rounded hover:bg-slate-800/60 transition-colors ${
                          m.completed ? 'text-slate-500 line-through' : 'text-slate-300'
                        }`}
                      >
                        {m.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <span className="text-[11px] leading-tight">{m.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Daily Habit Consistency Tracker with Week Heatmap */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-5 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Daily Habits Weekly Consistency Matrix</span>
            </h2>
            <p className="text-slate-400 mt-0.5">
              Habit completion is recorded by date in Asia/Kolkata timezone. Tap any day pill to toggle.
            </p>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono text-[11px]">
                <th className="py-2 pr-4 font-medium">Habit Action</th>
                <th className="py-2 px-3 font-medium text-center">Category</th>
                {weekDates.map((d) => (
                  <th key={d} className="py-2 px-2 text-center font-medium">
                    <div>{getDayName(d).slice(0, 3)}</div>
                    <div className="text-[10px] text-slate-400">{d.split('-')[2]}</div>
                  </th>
                ))}
                <th className="py-2 pl-3 font-medium text-right">Weekly Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {habits.map((habit) => {
                const completedInWeek = weekDates.filter((d) => habit.history[d]).length;
                const weekRate = Math.round((completedInWeek / 7) * 100);

                return (
                  <tr key={habit.id} className="hover:bg-slate-850/40">
                    <td className="py-3 pr-4 font-semibold text-slate-200">
                      {habit.title}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 capitalize">
                        {habit.category}
                      </span>
                    </td>
                    {weekDates.map((d) => {
                      const isChecked = Boolean(habit.history[d]);
                      return (
                        <td key={d} className="py-3 px-2 text-center">
                          <button
                            onClick={() => onToggleHabitDate(habit.id, d)}
                            className="p-1 rounded transition-colors hover:bg-slate-800"
                          >
                            {isChecked ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950 mx-auto" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-800 hover:text-slate-600 mx-auto" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="py-3 pl-3 text-right font-mono font-bold text-slate-300 tabular-nums">
                      {weekRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateGoal}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-slate-100">Create Strategic Goal</h3>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Goal Title</label>
              <input
                type="text"
                required
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. Master Linear Algebra & Score 95+ in Examination"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Description & Purpose</label>
              <textarea
                value={goalDesc}
                onChange={(e) => setGoalDesc(e.target.value)}
                placeholder="Why this goal matters for your AI developer path..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Goal Horizon</label>
                <select
                  value={goalLevel}
                  onChange={(e) => setGoalLevel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="long_term">Long-Term (Semester/Career)</option>
                  <option value="short_term">Short-Term (Month/Exam)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Habit Modal */}
      {isHabitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateHabit}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 space-y-4 text-xs"
          >
            <h3 className="text-sm font-bold text-slate-100">Add Daily Habit</h3>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Habit Name</label>
              <input
                type="text"
                required
                value={habitTitle}
                onChange={(e) => setHabitTitle(e.target.value)}
                placeholder="e.g. 20 min Engineering Math formula recall"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select
                value={habitCategory}
                onChange={(e) => setHabitCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
              >
                <option value="study">Study</option>
                <option value="health">Health & Sleep</option>
                <option value="mindset">Mindset & Review</option>
                <option value="routine">Routine</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsHabitModalOpen(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md"
              >
                Add Habit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
