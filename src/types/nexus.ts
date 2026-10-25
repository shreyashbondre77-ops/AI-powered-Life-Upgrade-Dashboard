export type PlanningMode = 'normal' | 'free_lecture' | 'exam_prep' | 'exam_day' | 'recovery';
export type EnergyLevel = 'high' | 'medium' | 'low';
export type TargetPace = 'minimum' | 'target' | 'stretch';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
export type TopicStatus = 'not_started' | 'in_progress' | 'learned' | 'needs_revision' | 'mastered';

export interface UserProfile {
  name: string;
  branch: string;
  college: string;
  timezone: string;
  wakeTime: string;           // "06:30"
  sleepTime: string;          // "23:00"
  leaveHomeTime: string;      // "09:00"
  collegeStartTime: string;   // "10:15"
  collegeEndTime: string;     // "17:15"
  normalReachHomeTime: string;// "18:15"
  earlyReachHomeTime: string; // "16:00"
  drivingClass: {
    enabled: boolean;
    title: string;
    startTime: string;        // "20:00"
    endTime: string;          // "21:00"
    startDate: string;        // "2026-10-20"
    endDate: string;          // "2026-11-10"
  };
  nextExamStartDate: string;  // "2026-11-16"
  examPrepWindowDays: number; // 21
  pythonDailyMinutesTarget: number; // 35
  activeDailyMode: PlanningMode;
  currentEnergy: EnergyLevel;
  targetPace: TargetPace;
  onboardingCompleted: boolean;
  isDemoMode: boolean;
}

export interface Topic {
  id: string;
  title: string;
  status: TopicStatus;
  difficulty: number;         // 1 to 5
  confidence: number;         // 1 to 5
  examRelevance: 'high' | 'medium' | 'low';
  lastStudiedDate: string | null;
  lastRevisionDate: string | null;
  timeSpentMinutes: number;
  practiceSolvedCount: number;
  notes: string;
}

export interface Chapter {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  examDate?: string;
  examTime?: string;
  difficulty: number;         // 1 to 5
  confidence: number;         // 1 to 5
  importance: 'high' | 'medium' | 'low';
  color: string;
  units: Unit[];
}

export interface ScheduledTask {
  id: string;
  date: string;               // YYYY-MM-DD
  title: string;
  subjectId?: string;
  subjectName?: string;
  topicId?: string;
  topicTitle?: string;
  pythonLessonId?: string;
  type: 'engineering' | 'python' | 'assignment' | 'habit' | 'revision' | 'exam_prep' | 'review';
  priority: TaskPriority;
  estimatedMinutes: number;
  actualMinutes: number;
  status: TaskStatus;
  completedAt?: string;
  startTime?: string;
  endTime?: string;
  suggestedMethod?: string;
  completionCriteria?: string;
  reasonSelected?: string;
  notes?: string;
  postponeReason?: string;
}

export interface TimetableBlock {
  id: string;
  startTime: string;          // "10:15"
  endTime: string;            // "17:15"
  title: string;
  type: 'college' | 'commute' | 'driving_class' | 'meal' | 'study' | 'python' | 'rest' | 'exam';
  isFixed: boolean;
  associatedTaskId?: string;
  notes?: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  category: 'study' | 'health' | 'mindset' | 'routine';
  targetDaily: boolean;
  history: Record<string, boolean>; // 'YYYY-MM-DD' -> true
}

export interface Goal {
  id: string;
  level: 'long_term' | 'short_term';
  title: string;
  description: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  progress: number;           // 0-100
  milestones: Array<{
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string;
  }>;
  linkedSubjectId?: string;
}

export interface PythonExercise {
  task: string;
  starterCode: string;
  solution: string;
  expectedOutput: string;
  hint?: string;
}

export interface PythonLesson {
  id: string;
  title: string;
  concept: string;
  codeExample: string;
  exercise: PythonExercise;
  status: 'not_started' | 'in_progress' | 'completed';
  notes?: string;
  completedAt?: string;
}

export interface PythonModule {
  id: string;
  number: number;
  title: string;
  description: string;
  estimatedHours: number;
  status: 'not_started' | 'in_progress' | 'completed';
  lessons: PythonLesson[];
}

export interface PythonProject {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed';
  githubUrl?: string;
  completedAt?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface StudySession {
  id: string;
  date: string;               // YYYY-MM-DD
  startTime: string;
  endTime: string;
  durationMinutes: number;
  subjectId?: string;
  subjectName?: string;
  topicTitle?: string;
  type: 'engineering' | 'python' | 'revision' | 'mock_exam';
  reflectionRating: number;   // 1 to 5
  reflectionNotes: string;
}

export interface EndOfDayReview {
  date: string;
  completed: boolean;
  rating: number;             // 1 to 5
  achievements: string;
  whatWentWrong: string;
  studySatisfaction: number;  // 1 to 5
  tomorrowFocus: string;
  completedAt: string;
}

export interface WeeklyReviewReport {
  weekLabel: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  source: 'ai' | 'rule_based';
  q1_what_went_well: string;
  q2_repeatedly_postponed: string;
  q3_neglected_subjects: string;
  q4_estimation_accuracy: string;
  q5_habits_trend: string;
  q6_biggest_obstacle: string;
  q7_three_changes: string;
}

export interface NexusAppState {
  profile: UserProfile;
  subjects: Subject[];
  tasks: ScheduledTask[];
  sessions: StudySession[];
  habits: Habit[];
  goals: Goal[];
  pythonModules: PythonModule[];
  pythonProjects: PythonProject[];
  reviews: Record<string, EndOfDayReview>; // date -> review
  weeklyReports: WeeklyReviewReport[];
}
