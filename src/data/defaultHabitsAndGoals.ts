import { Habit, Goal, UserProfile } from '../types/nexus';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Shreyash',
  branch: 'Artificial Intelligence and Data Science (AI&DS)',
  college: 'Engineering College',
  timezone: 'Asia/Kolkata',
  wakeTime: '06:30',
  sleepTime: '23:00',
  leaveHomeTime: '09:00',
  collegeStartTime: '10:15',
  collegeEndTime: '17:15',
  normalReachHomeTime: '18:15',
  earlyReachHomeTime: '16:00',
  drivingClass: {
    enabled: true,
    title: 'Driving Class',
    startTime: '20:00',
    endTime: '21:00',
    startDate: '2026-10-20',
    endDate: '2026-11-10',
  },
  nextExamStartDate: '2026-11-16',
  examPrepWindowDays: 21,
  pythonDailyMinutesTarget: 35,
  activeDailyMode: 'normal',
  currentEnergy: 'high',
  targetPace: 'target',
  onboardingCompleted: true,
  isDemoMode: false,
};

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'h_study',
    title: 'Complete Planned Study Sessions',
    description: 'Stick to scheduled academic study blocks without multitasking.',
    category: 'study',
    targetDaily: true,
    history: {
      '2026-10-23': true,
      '2026-10-24': true,
    },
  },
  {
    id: 'h_python',
    title: 'Python Hands-On Practice',
    description: 'Write, debug or test code for at least 25 minutes.',
    category: 'study',
    targetDaily: true,
    history: {
      '2026-10-22': true,
      '2026-10-23': true,
      '2026-10-24': true,
    },
  },
  {
    id: 'h_sleep',
    title: '7.5 Hours Restorative Sleep',
    description: 'In bed by 11:00 PM to protect mental stamina and memory consolidation.',
    category: 'health',
    targetDaily: true,
    history: {
      '2026-10-23': true,
      '2026-10-24': true,
    },
  },
  {
    id: 'h_water',
    title: 'Daily Hydration Target (2.5 - 3L)',
    description: 'Maintain steady hydration throughout college lectures and evening study.',
    category: 'health',
    targetDaily: true,
    history: {
      '2026-10-24': true,
    },
  },
  {
    id: 'h_movement',
    title: 'Daily Movement / Exercise (20+ mins)',
    description: 'Brisk walk, stretching, or light workout to reduce sitting fatigue.',
    category: 'health',
    targetDaily: true,
    history: {
      '2026-10-23': true,
    },
  },
  {
    id: 'h_review',
    title: 'End-of-Day Reflection & Tomorrow Plan',
    description: 'Log actual minutes, reflect on friction points, and preview tomorrow.',
    category: 'mindset',
    targetDaily: true,
    history: {
      '2026-10-24': true,
    },
  },
  {
    id: 'h_focus',
    title: 'Limit Avoidable Phone Distractions',
    description: 'Keep phone on silent / in another room during focused study blocks.',
    category: 'routine',
    targetDaily: true,
    history: {
      '2026-10-24': true,
    },
  },
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g_eng_cgpa',
    level: 'long_term',
    title: 'Build Strong Engineering Fundamentals (Target 9.0+ CGPA)',
    description: 'Master core mathematics, physics, computing and analytical thinking in 1st year AI&DS.',
    deadline: '2026-12-15',
    priority: 'high',
    progress: 42,
    milestones: [
      { id: 'm_1_1', title: 'Complete Matrices & Linear Algebra with 100% problem practice', completed: true, completedAt: '2026-10-23' },
      { id: 'm_1_2', title: 'Derive and solve all Engineering Physics thin-film & wave problems', completed: false },
      { id: 'm_1_3', title: 'Complete first 3 units of all 5 subjects 10 days before exam', completed: false },
      { id: 'm_1_4', title: 'Solve 3 previous year university question papers per subject', completed: false },
    ],
  },
  {
    id: 'g_ai_dev',
    level: 'long_term',
    title: 'Become a Capable Software & AI Developer',
    description: 'Gain fluency in Python, data structures, Git, building functional apps, and AI APIs.',
    deadline: '2027-04-30',
    priority: 'high',
    progress: 35,
    milestones: [
      { id: 'm_2_1', title: 'Master Python core syntax, loops, and data structures', completed: true, completedAt: '2026-10-22' },
      { id: 'm_2_2', title: 'Build and deploy first CLI utility to GitHub with clean README', completed: false },
      { id: 'm_2_3', title: 'Complete NumPy & Pandas data manipulation projects', completed: false },
      { id: 'm_2_4', title: 'Build a production web application with Gemini AI integration', completed: false },
    ],
  },
  {
    id: 'g_nov_exam',
    level: 'short_term',
    title: 'November 2026 Examination Peak Readiness',
    description: 'Systematic 21-day syllabus revision, active recall drills, and mock test solving.',
    deadline: '2026-11-16',
    priority: 'high',
    progress: 30,
    milestones: [
      { id: 'm_3_1', title: 'Review all low-confidence (<=2 stars) topics across all 5 subjects', completed: false },
      { id: 'm_3_2', title: 'Prepare one-page formula formula revision sheets for each subject', completed: false },
      { id: 'm_3_3', title: 'Simulate 2 timed 3-hour mock exams under real conditions', completed: false },
    ],
  },
];
