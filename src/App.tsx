import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TodayView } from './components/TodayView';
import { PlannerView } from './components/PlannerView';
import { EngineeringView } from './components/EngineeringView';
import { PythonPathView } from './components/PythonPathView';
import { GoalsHabitsView } from './components/GoalsHabitsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { FocusTimerModal } from './components/FocusTimerModal';
import { EndOfDayReviewModal } from './components/EndOfDayReviewModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import {
  NexusAppState,
  ScheduledTask,
  StudySession,
  Topic,
  PlanningMode,
  EnergyLevel,
  TargetPace,
  EndOfDayReview,
  WeeklyReviewReport,
  UserProfile,
  Subject,
} from './types/nexus';
import { loadAppState, saveAppState } from './utils/storage';
import { generateAdaptiveDayPlan } from './utils/schedulingEngine';
import { getTodayDateString } from './utils/dateUtils';

export default function App() {
  const [state, setState] = useState<NexusAppState>(() => loadAppState());
  const [currentView, setCurrentView] = useState<string>('today');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Modals state
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);
  const [timerInitialSubjectId, setTimerInitialSubjectId] = useState<string | undefined>();
  const [timerInitialTopicTitle, setTimerInitialTopicTitle] = useState<string | undefined>();
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  const today = getTodayDateString();

  // Save changes to localStorage and server API
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Open onboarding on first run if not completed
  useEffect(() => {
    if (!state.profile.onboardingCompleted) {
      setIsOnboardingOpen(true);
    }
  }, [state.profile.onboardingCompleted]);

  // Generate today's schedule dynamically
  const { timetable, recommendationReason } = generateAdaptiveDayPlan(
    state.profile,
    state.subjects,
    state.tasks,
    today,
    state.profile.activeDailyMode
  );

  // Calculate today's completed study minutes from sessions
  const todaySessions = state.sessions.filter((s) => s.date === today);
  const todayCompletedMins = todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  // Handlers for Plan & Tasks
  const handleRebuildPlan = () => {
    const result = generateAdaptiveDayPlan(
      state.profile,
      state.subjects,
      state.tasks,
      today,
      state.profile.activeDailyMode
    );

    // Keep existing completed or custom tasks, merge new scheduled tasks
    const existingIds = new Set(state.tasks.map((t) => t.id));
    const merged = [...state.tasks];
    result.tasks.forEach((t) => {
      if (!existingIds.has(t.id)) {
        merged.push(t);
      }
    });

    setState((prev) => ({
      ...prev,
      tasks: merged,
    }));
  };

  const handleUpdateTaskStatus = (
    taskId: string,
    status: ScheduledTask['status'],
    actualMins?: number
  ) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status,
            actualMinutes: actualMins !== undefined ? actualMins : t.actualMinutes,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      }),
    }));
  };

  const handlePostponeTask = (taskId: string, reason: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'postponed',
            postponeReason: reason,
          };
        }
        return t;
      }),
    }));
  };

  const handleAddTask = (newTask: ScheduledTask) => {
    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  // Habits Handlers
  const handleToggleHabit = (habitId: string, date: string = today) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id === habitId) {
          const newHistory = { ...h.history };
          if (newHistory[date]) {
            delete newHistory[date];
          } else {
            newHistory[date] = true;
          }
          return { ...h, history: newHistory };
        }
        return h;
      }),
    }));
  };

  // Focus Session Trigger
  const handleStartFocusOnTask = (task: ScheduledTask) => {
    setTimerInitialSubjectId(task.subjectId);
    setTimerInitialTopicTitle(task.topicTitle || task.title);
    setIsTimerOpen(true);
  };

  const handleStartFocusOnTopic = (subjectId: string, topicTitle: string) => {
    setTimerInitialSubjectId(subjectId);
    setTimerInitialTopicTitle(topicTitle);
    setIsTimerOpen(true);
  };

  const handleStartFocusOnPython = (title: string) => {
    setTimerInitialSubjectId(undefined);
    setTimerInitialTopicTitle(`Python: ${title}`);
    setIsTimerOpen(true);
  };

  const handleSessionComplete = (session: StudySession) => {
    // 1. Add session to records
    // 2. Update topic study time if matched
    setState((prev) => {
      const updatedSessions = [session, ...prev.sessions];
      let updatedSubjects = prev.subjects;

      if (session.subjectId) {
        updatedSubjects = prev.subjects.map((sub) => {
          if (sub.id === session.subjectId) {
            return {
              ...sub,
              units: sub.units.map((u) => ({
                ...u,
                chapters: u.chapters.map((c) => ({
                  ...c,
                  topics: c.topics.map((top) => {
                    if (session.topicTitle && top.title.includes(session.topicTitle)) {
                      return {
                        ...top,
                        timeSpentMinutes: (top.timeSpentMinutes || 0) + session.durationMinutes,
                        lastStudiedDate: today,
                        status: top.status === 'not_started' ? 'in_progress' : top.status,
                      };
                    }
                    return top;
                  }),
                })),
              })),
            };
          }
          return sub;
        });
      }

      return {
        ...prev,
        sessions: updatedSessions,
        subjects: updatedSubjects,
      };
    });
  };

  // Mode and Energy changes
  const handleChangeMode = (mode: PlanningMode) => {
    setState((prev) => {
      const updatedProfile = { ...prev.profile, activeDailyMode: mode };
      const { tasks } = generateAdaptiveDayPlan(
        updatedProfile,
        prev.subjects,
        prev.tasks,
        today,
        mode
      );
      return {
        ...prev,
        profile: updatedProfile,
        tasks,
      };
    });
  };

  const handleChangeEnergy = (energy: EnergyLevel) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, currentEnergy: energy },
    }));
  };

  const handleChangePace = (pace: TargetPace) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, targetPace: pace },
    }));
  };

  // Topic Updates
  const handleUpdateTopic = (subjectId: string, topicId: string, updates: Partial<Topic>) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => {
        if (s.id === subjectId) {
          return {
            ...s,
            units: s.units.map((u) => ({
              ...u,
              chapters: u.chapters.map((c) => ({
                ...c,
                topics: c.topics.map((t) => (t.id === topicId ? { ...t, ...updates } : t)),
              })),
            })),
          };
        }
        return s;
      }),
    }));
  };

  const handleAddTopic = (
    subjectId: string,
    unitId: string,
    chapterId: string,
    newTopicTitle: string
  ) => {
    const newTopic: Topic = {
      id: `topic_${Date.now()}`,
      title: newTopicTitle,
      status: 'not_started',
      difficulty: 3,
      confidence: 2,
      examRelevance: 'high',
      lastStudiedDate: null,
      lastRevisionDate: null,
      timeSpentMinutes: 0,
      practiceSolvedCount: 0,
      notes: '',
    };

    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => {
        if (s.id === subjectId) {
          return {
            ...s,
            units: s.units.map((u) => {
              if (u.id === unitId) {
                return {
                  ...u,
                  chapters: u.chapters.map((c) => {
                    if (c.id === chapterId) {
                      return {
                        ...c,
                        topics: [...c.topics, newTopic],
                      };
                    }
                    return c;
                  }),
                };
              }
              return u;
            }),
          };
        }
        return s;
      }),
    }));
  };

  // Python Updates
  const handleUpdateLessonStatus = (
    moduleId: string,
    lessonId: string,
    status: 'completed' | 'in_progress'
  ) => {
    setState((prev) => ({
      ...prev,
      pythonModules: prev.pythonModules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, status } : l)),
          };
        }
        return m;
      }),
    }));
  };

  // Goal Milestones
  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => {
        if (g.id === goalId) {
          const updatedMilestones = g.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          const completedCount = updatedMilestones.filter((m) => m.completed).length;
          const progress = Math.round((completedCount / updatedMilestones.length) * 100);
          return {
            ...g,
            milestones: updatedMilestones,
            progress,
          };
        }
        return g;
      }),
    }));
  };

  // End of Day Review Save
  const handleSaveReview = (review: EndOfDayReview) => {
    setState((prev) => {
      // Mark review habit completed
      const updatedHabits = prev.habits.map((h) => {
        if (h.id === 'h_review' || h.title.includes('Review')) {
          return {
            ...h,
            history: { ...h.history, [today]: true },
          };
        }
        return h;
      });

      return {
        ...prev,
        reviews: { ...prev.reviews, [today]: review },
        habits: updatedHabits,
      };
    });
  };

  // AI Weekly Review via server API
  const handleGenerateAIReview = async (): Promise<WeeklyReviewReport | null> => {
    try {
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: state.subjects,
          sessions: state.sessions,
          tasks: state.tasks,
          habits: state.habits,
          profile: state.profile,
          weekLabel: `Week of ${today}`,
        }),
      });

      const data = await response.json();
      if (data.success && data.report) {
        setState((prev) => ({
          ...prev,
          weeklyReports: [data.report, ...prev.weeklyReports],
        }));
        return data.report;
      }
    } catch (err) {
      console.error('Failed to call AI advisor:', err);
    }
    return null;
  };

  // Onboarding completion
  const handleOnboardingComplete = (newProfile: UserProfile, newSubjects: Subject[]) => {
    const { tasks } = generateAdaptiveDayPlan(newProfile, newSubjects, [], today, newProfile.activeDailyMode);
    setState((prev) => ({
      ...prev,
      profile: newProfile,
      subjects: newSubjects,
      tasks,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <Header
        profile={state.profile}
        currentView={currentView}
        onOpenTimer={() => {
          setTimerInitialSubjectId(undefined);
          setTimerInitialTopicTitle(undefined);
          setIsTimerOpen(true);
        }}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onQuickPlanRebuild={handleRebuildPlan}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          profile={state.profile}
          onChangeMode={handleChangeMode}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-20 md:pb-10">
          {currentView === 'today' && (
            <TodayView
              profile={state.profile}
              tasks={state.tasks.filter((t) => t.date === today)}
              timetable={timetable}
              habits={state.habits}
              subjects={state.subjects}
              todayCompletedMins={todayCompletedMins}
              recommendationReason={recommendationReason}
              onToggleHabit={(hid) => handleToggleHabit(hid, today)}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onPostponeTask={handlePostponeTask}
              onStartFocusOnTask={handleStartFocusOnTask}
              onRebuildPlan={handleRebuildPlan}
              onChangeEnergy={handleChangeEnergy}
              onChangeMode={handleChangeMode}
              onOpenReviewModal={() => setIsReviewOpen(true)}
            />
          )}

          {currentView === 'planner' && (
            <PlannerView
              profile={state.profile}
              tasks={state.tasks}
              timetable={timetable}
              subjects={state.subjects}
              onChangeMode={handleChangeMode}
              onChangePace={handleChangePace}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onReplan={handleRebuildPlan}
            />
          )}

          {currentView === 'engineering' && (
            <EngineeringView
              subjects={state.subjects}
              onUpdateTopic={handleUpdateTopic}
              onAddTopic={handleAddTopic}
              onStartFocusOnTopic={handleStartFocusOnTopic}
            />
          )}

          {currentView === 'python' && (
            <PythonPathView
              modules={state.pythonModules}
              projects={state.pythonProjects}
              dailyMinutesTarget={state.profile.pythonDailyMinutesTarget}
              onUpdateDailyTarget={(mins) =>
                setState((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, pythonDailyMinutesTarget: mins },
                }))
              }
              onUpdateLessonStatus={handleUpdateLessonStatus}
              onUpdateProject={(pid, updates) =>
                setState((prev) => ({
                  ...prev,
                  pythonProjects: prev.pythonProjects.map((p) =>
                    p.id === pid ? { ...p, ...updates } : p
                  ),
                }))
              }
              onStartFocusOnPython={handleStartFocusOnPython}
            />
          )}

          {currentView === 'goals' && (
            <GoalsHabitsView
              goals={state.goals}
              habits={state.habits}
              onToggleMilestone={handleToggleMilestone}
              onAddGoal={(g) => setState((prev) => ({ ...prev, goals: [g, ...prev.goals] }))}
              onDeleteGoal={(gid) =>
                setState((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== gid) }))
              }
              onToggleHabitDate={handleToggleHabit}
              onAddHabit={(h) => setState((prev) => ({ ...prev, habits: [h, ...prev.habits] }))}
              onDeleteHabit={(hid) =>
                setState((prev) => ({ ...prev, habits: prev.habits.filter((h) => h.id !== hid) }))
              }
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              state={state}
              onGenerateAIReview={handleGenerateAIReview}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              state={state}
              onUpdateProfile={(updated) => setState((prev) => ({ ...prev, profile: updated }))}
              onUpdateSubjects={(updated) => setState((prev) => ({ ...prev, subjects: updated }))}
              onRestoreState={(restored) => setState(restored)}
            />
          )}
        </main>
      </div>

      {/* Focus Timer Modal */}
      <FocusTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        subjects={state.subjects}
        initialSubjectId={timerInitialSubjectId}
        initialTopicTitle={timerInitialTopicTitle}
        onSessionComplete={handleSessionComplete}
      />

      {/* End of Day Review Modal */}
      <EndOfDayReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        tasks={state.tasks.filter((t) => t.date === today)}
        todayCompletedMins={todayCompletedMins}
        todayPlannedMins={state.tasks
          .filter((t) => t.date === today)
          .reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0)}
        onSaveReview={handleSaveReview}
      />

      {/* Onboarding Setup Wizard */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        profile={state.profile}
        subjects={state.subjects}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
