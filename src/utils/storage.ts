import { NexusAppState } from '../types/nexus';
import { INITIAL_USER_PROFILE, INITIAL_HABITS, INITIAL_GOALS } from '../data/defaultHabitsAndGoals';
import { DEFAULT_AIDS_SUBJECTS } from '../data/defaultSyllabus';
import { INITIAL_PYTHON_MODULES, INITIAL_PYTHON_PROJECTS } from '../data/pythonRoadmapData';
import { generateAdaptiveDayPlan } from './schedulingEngine';
import { getTodayDateString } from './dateUtils';

const STORAGE_KEY = 'nexus_daily_os_state_v1';

export function getInitialDefaultState(): NexusAppState {
  const profile = { ...INITIAL_USER_PROFILE };
  const subjects = [...DEFAULT_AIDS_SUBJECTS];
  const habits = [...INITIAL_HABITS];
  const goals = [...INITIAL_GOALS];
  const pythonModules = [...INITIAL_PYTHON_MODULES];
  const pythonProjects = [...INITIAL_PYTHON_PROJECTS];
  const today = getTodayDateString();

  // Generate today's initial tasks
  const { tasks } = generateAdaptiveDayPlan(profile, subjects, [], today);

  return {
    profile,
    subjects,
    tasks,
    sessions: [
      {
        id: 'sess_init_1',
        date: '2026-10-23',
        startTime: '18:45',
        endTime: '19:30',
        durationMinutes: 45,
        subjectId: 'sub_math',
        subjectName: 'Engineering Mathematics I',
        topicTitle: 'Rank of a Matrix & Echelon Form',
        type: 'engineering',
        reflectionRating: 4,
        reflectionNotes: 'Solves 5 problems on row reduction cleanly. Echelon form steps are solid.',
      },
      {
        id: 'sess_init_2',
        date: '2026-10-23',
        startTime: '21:15',
        endTime: '21:55',
        durationMinutes: 40,
        subjectName: 'Python Programming',
        topicTitle: 'Conditional Branching & Attendance Checker',
        type: 'python',
        reflectionRating: 5,
        reflectionNotes: 'Passed test cases on first run. Code is clean and formatted.',
      },
      {
        id: 'sess_init_3',
        date: '2026-10-24',
        startTime: '18:45',
        endTime: '19:40',
        durationMinutes: 55,
        subjectId: 'sub_physics',
        subjectName: 'Engineering Physics',
        topicTitle: "Thin Films & Newton's Rings",
        type: 'engineering',
        reflectionRating: 4,
        reflectionNotes: 'Derived radius of dark ring equation. Confident on mathematical derivation.',
      },
      {
        id: 'sess_init_4',
        date: '2026-10-24',
        startTime: '21:15',
        endTime: '21:45',
        durationMinutes: 30,
        subjectName: 'Python Programming',
        topicTitle: 'Accumulator Pattern & Divisibility',
        type: 'python',
        reflectionRating: 4,
        reflectionNotes: 'Good practice with range step arguments.',
      },
    ],
    habits,
    goals,
    pythonModules,
    pythonProjects,
    reviews: {
      '2026-10-24': {
        date: '2026-10-24',
        completed: true,
        rating: 4,
        achievements: 'Studied Physics thin films derivation, solved Python loops exercises, and arrived on time for driving class.',
        whatWentWrong: 'Commute back home had 15 mins traffic delay; compensated by shortening dinner break rather than study block.',
        studySatisfaction: 4,
        tomorrowFocus: 'Eigenvalues and Eigenvectors in Engineering Mathematics.',
        completedAt: '2026-10-24T22:50:00+05:30',
      },
    },
    weeklyReports: [
      {
        weekLabel: 'Week of Oct 19 - Oct 25, 2026',
        startDate: '2026-10-19',
        endDate: '2026-10-25',
        generatedAt: '2026-10-25T08:00:00+05:30',
        source: 'rule_based',
        q1_what_went_well: 'Engineering Physics and Mathematics received consistent study focus. Python practice maintained 4 days out of 5.',
        q2_repeatedly_postponed: 'Basic Electrical & Electronics (EE101) Thevenin Theorem practice was rescheduled twice.',
        q3_neglected_subjects: 'Engineering Mechanics (ME101) received zero study hours this week due to heavy mathematics focus.',
        q4_estimation_accuracy: 'Study duration was estimated well (planned 45 mins vs actual 42 mins average).',
        q5_habits_trend: 'Sleep schedule (11:00 PM) was respected 4 out of 5 days. Water intake met target on 3 days.',
        q6_biggest_obstacle: 'Late evening fatigue after driving class (20:00-21:00) reduces energy for complex derivations.',
        q7_three_changes: '1. Shift complex engineering derivations to the 18:45 pre-driving slot. 2. Schedule two 40-minute blocks for Engineering Mechanics. 3. Prepare revision flashcards for EE101 Thevenin theorem.',
      },
    ],
  };
}

export function loadAppState(): NexusAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure essential fields exist
      if (parsed.profile && parsed.subjects && parsed.tasks) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse saved state from localStorage:', err);
  }
  const defaultState = getInitialDefaultState();
  saveAppState(defaultState);
  return defaultState;
}

export function saveAppState(state: NexusAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Asynchronously sync with backend if running
    fetch('/api/nexus-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }).catch(() => {
      // Backend may be offline or in preview; localStorage remains source of truth
    });
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

/**
 * Export study sessions and tasks to CSV format
 */
export function exportStudyLogsCSV(state: NexusAppState): string {
  const headers = ['Date', 'Type', 'Subject / Category', 'Topic / Task Title', 'Duration (Minutes)', 'Rating (1-5)', 'Reflection / Notes'];
  const rows: string[] = [headers.join(',')];

  state.sessions.forEach((s) => {
    const escape = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;
    rows.push([
      s.date,
      s.type,
      escape(s.subjectName || 'General'),
      escape(s.topicTitle || 'Self Study'),
      s.durationMinutes.toString(),
      s.reflectionRating.toString(),
      escape(s.reflectionNotes),
    ].join(','));
  });

  return rows.join('\n');
}

/**
 * Export full JSON backup
 */
export function exportFullBackupJSON(state: NexusAppState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
