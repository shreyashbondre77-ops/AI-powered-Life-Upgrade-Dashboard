import {
  UserProfile,
  Subject,
  ScheduledTask,
  TimetableBlock,
  PlanningMode,
  Topic,
} from '../types/nexus';
import {
  getTodayDateString,
  timeToMinutes,
  minutesToTime,
  isDateInRange,
  isWeekend,
  daysBetween,
} from './dateUtils';

export interface GenerationResult {
  timetable: TimetableBlock[];
  tasks: ScheduledTask[];
  recommendationReason: string;
}

/**
 * Intelligent Adaptive Scheduling Engine for NEXUS Daily OS
 */
export function generateAdaptiveDayPlan(
  profile: UserProfile,
  subjects: Subject[],
  existingTasks: ScheduledTask[],
  targetDate: string = getTodayDateString(),
  modeOverride?: PlanningMode
): GenerationResult {
  const activeMode: PlanningMode = modeOverride || profile.activeDailyMode;
  const isTargetWeekend = isWeekend(targetDate);
  const timetable: TimetableBlock[] = [];
  const tasks: ScheduledTask[] = [];

  // Check if driving class is currently active for this date
  const isDrivingActive =
    profile.drivingClass.enabled &&
    Boolean(profile.drivingClass.startDate && profile.drivingClass.endDate) &&
    isDateInRange(targetDate, profile.drivingClass.startDate, profile.drivingClass.endDate);

  // 1. Build Fixed Blocks
  if (!isTargetWeekend) {
    if (activeMode === 'free_lecture') {
      // Early return: Leaves college earlier (e.g. 15:15) and arrives home at earlyReachHomeTime (16:00)
      timetable.push({
        id: `fixed_commute_morn_${targetDate}`,
        startTime: profile.leaveHomeTime,
        endTime: profile.collegeStartTime,
        title: 'Commute to College (Protected Transit)',
        type: 'commute',
        isFixed: true,
      });
      timetable.push({
        id: `fixed_college_${targetDate}`,
        startTime: profile.collegeStartTime,
        endTime: '15:15',
        title: 'College Lectures & Labs (Early Dismissal)',
        type: 'college',
        isFixed: true,
      });
      timetable.push({
        id: `fixed_commute_eve_${targetDate}`,
        startTime: '15:15',
        endTime: profile.earlyReachHomeTime,
        title: 'Commute Home (Early Return Arrival)',
        type: 'commute',
        isFixed: true,
      });
    } else {
      // Normal college schedule
      timetable.push({
        id: `fixed_commute_morn_${targetDate}`,
        startTime: profile.leaveHomeTime,
        endTime: profile.collegeStartTime,
        title: 'Commute to College (Protected Transit)',
        type: 'commute',
        isFixed: true,
      });
      timetable.push({
        id: `fixed_college_${targetDate}`,
        startTime: profile.collegeStartTime,
        endTime: profile.collegeEndTime,
        title: 'College Lectures & Practical Labs',
        type: 'college',
        isFixed: true,
      });
      timetable.push({
        id: `fixed_commute_eve_${targetDate}`,
        startTime: profile.collegeEndTime,
        endTime: profile.normalReachHomeTime,
        title: 'Commute Home (Evening Transit)',
        type: 'commute',
        isFixed: true,
      });
    }
  }

  // Temporary Driving Class Block
  if (isDrivingActive) {
    timetable.push({
      id: `fixed_driving_${targetDate}`,
      startTime: profile.drivingClass.startTime,
      endTime: profile.drivingClass.endTime,
      title: `${profile.drivingClass.title} (Active Temporary Term)`,
      type: 'driving_class',
      isFixed: true,
      notes: `Temporary calendar event ending ${profile.drivingClass.endDate}`,
    });
  }

  // 2. Identify Academic & Topic Priorities
  // Rank subjects by upcoming exam date, lowest average confidence, or neglect
  const subjectRankings = [...subjects].map((sub) => {
    // Gather all topics
    const allTopics: { unitNum: number; unitTitle: string; topic: Topic }[] = [];
    sub.units.forEach((u) => {
      u.chapters.forEach((c) => {
        c.topics.forEach((t) => {
          allTopics.push({ unitNum: u.unitNumber, unitTitle: u.title, topic: t });
        });
      });
    });

    const notStarted = allTopics.filter((t) => t.topic.status === 'not_started').length;
    const needsRevision = allTopics.filter((t) => t.topic.status === 'needs_revision').length;
    const inProgress = allTopics.filter((t) => t.topic.status === 'in_progress').length;
    const avgConfidence = allTopics.length
      ? allTopics.reduce((acc, cur) => acc + cur.topic.confidence, 0) / allTopics.length
      : 3;

    let examUrgencyScore = 0;
    if (sub.examDate) {
      const daysToExam = daysBetween(targetDate, sub.examDate);
      if (daysToExam > 0 && daysToExam <= 21) {
        examUrgencyScore = Math.max(0, 30 - daysToExam);
      }
    }

    // Urgency formula: exam weight + low confidence weight + unlearned topics
    const priorityScore =
      examUrgencyScore * 3 +
      (5 - avgConfidence) * 2 +
      needsRevision * 2 +
      inProgress * 1.5 +
      notStarted * 0.5;

    return {
      subject: sub,
      allTopics,
      avgConfidence,
      priorityScore,
      needsRevision,
      inProgress,
      notStarted,
    };
  });

  // Sort descending by priority
  subjectRankings.sort((a, b) => b.priorityScore - a.priorityScore);

  let recommendationReason = '';

  // 3. Mode-Specific Scheduling Strategy
  if (activeMode === 'recovery') {
    recommendationReason =
      'Recovery Mode Active: Preserving sleep and rest. Reduced workload to 1 primary conceptual revision and habit maintenance.';

    // Single gentle study slot: 19:00 - 19:45
    const primarySubject = subjectRankings[0]?.subject;
    const targetTopicObj = subjectRankings[0]?.allTopics.find(
      (t) => t.topic.status === 'in_progress' || t.topic.status === 'needs_revision'
    ) || subjectRankings[0]?.allTopics[0];

    if (primarySubject && targetTopicObj) {
      const task: ScheduledTask = {
        id: `task_recov_${targetDate}_1`,
        date: targetDate,
        title: `${primarySubject.name} — ${targetTopicObj.topic.title}`,
        subjectId: primarySubject.id,
        subjectName: primarySubject.name,
        topicId: targetTopicObj.topic.id,
        topicTitle: targetTopicObj.topic.title,
        type: 'revision',
        priority: 'high',
        estimatedMinutes: 40,
        actualMinutes: 0,
        status: 'pending',
        startTime: '19:00',
        endTime: '19:40',
        suggestedMethod: 'Gentle active recall and concept summary in your own words. Do not overstrain.',
        completionCriteria: 'Explain 3 core points clearly from memory.',
        reasonSelected: 'Selected as the sole high-leverage review for recovery day.',
      };
      tasks.push(task);

      timetable.push({
        id: `block_study_recov_${targetDate}`,
        startTime: '19:00',
        endTime: '19:40',
        title: `${primarySubject.name}: ${targetTopicObj.topic.title}`,
        type: 'study',
        isFixed: false,
        associatedTaskId: task.id,
      });
    }

    // Rest & Early Wind-down
    timetable.push({
      id: `block_winddown_${targetDate}`,
      startTime: '21:30',
      endTime: profile.sleepTime,
      title: 'Restorative Wind-down & Adequate Sleep Protection',
      type: 'rest',
      isFixed: true,
      notes: 'No late-night cramming. Sustainable recovery builds tomorrow’s consistency.',
    });
  } else if (activeMode === 'exam_prep') {
    const daysToStart = profile.nextExamStartDate ? daysBetween(targetDate, profile.nextExamStartDate) : 21;
    recommendationReason = `Exam Preparation Mode Active (${daysToStart > 0 ? `${daysToStart} days to exams` : 'Exams Active'}): Prioritizing upcoming exam syllabus, high-difficulty concepts, question solving, and active recall. Python scaled to maintenance.`;

    // Exam prep sessions:
    // Slot 1: Evening 18:45 - 19:45 (Intensive Numerical / Theory Practice)
    // Slot 2: Night 21:15 - 22:30 (Active Recall & Previous Year Questions)
    const sub1 = subjectRankings[0];
    const sub2 = subjectRankings[1] || subjectRankings[0];

    const pickTopicForExam = (subObj: typeof sub1) => {
      if (!subObj) return null;
      // Prefer low confidence, needs_revision, or not_started with high exam relevance
      return (
        subObj.allTopics.find(
          (t) => t.topic.examRelevance === 'high' && (t.topic.confidence <= 2 || t.topic.status === 'needs_revision')
        ) ||
        subObj.allTopics.find((t) => t.topic.status === 'in_progress') ||
        subObj.allTopics[0]
      );
    };

    const topic1 = pickTopicForExam(sub1);
    if (sub1 && topic1) {
      const task1: ScheduledTask = {
        id: `task_examprep_1_${targetDate}`,
        date: targetDate,
        title: `${sub1.subject.name} — ${topic1.topic.title}`,
        subjectId: sub1.subject.id,
        subjectName: sub1.subject.name,
        topicId: topic1.topic.id,
        topicTitle: topic1.topic.title,
        type: 'exam_prep',
        priority: 'urgent',
        estimatedMinutes: 50,
        actualMinutes: 0,
        status: 'pending',
        startTime: '18:45',
        endTime: '19:35',
        suggestedMethod: 'Active recall + independent numerical problem solving without referring to notes.',
        completionCriteria: 'Solve 4 standard university exam questions correctly on paper.',
        reasonSelected: `High exam relevance with confidence ${topic1.topic.confidence}/5 in ${sub1.subject.name}.`,
      };
      tasks.push(task1);

      timetable.push({
        id: `block_examprep_1_${targetDate}`,
        startTime: '18:45',
        endTime: '19:35',
        title: `Exam Drill: ${sub1.subject.name} (${topic1.topic.title})`,
        type: 'study',
        isFixed: false,
        associatedTaskId: task1.id,
      });
    }

    const topic2 = pickTopicForExam(sub2);
    if (sub2 && topic2) {
      const task2: ScheduledTask = {
        id: `task_examprep_2_${targetDate}`,
        date: targetDate,
        title: `${sub2.subject.name} — ${topic2.topic.title}`,
        subjectId: sub2.subject.id,
        subjectName: sub2.subject.name,
        topicId: topic2.topic.id,
        topicTitle: topic2.topic.title,
        type: 'revision',
        priority: 'high',
        estimatedMinutes: 55,
        actualMinutes: 0,
        status: 'pending',
        startTime: isDrivingActive ? '21:15' : '20:15',
        endTime: isDrivingActive ? '22:10' : '21:10',
        suggestedMethod: 'Self-explanation technique + derivation write-up from memory.',
        completionCriteria: 'Derive key mathematical relations on a blank sheet without peeking.',
        reasonSelected: `Targeting weak area in ${sub2.subject.name} (Confidence: ${topic2.topic.confidence}/5).`,
      };
      tasks.push(task2);

      timetable.push({
        id: `block_examprep_2_${targetDate}`,
        startTime: task2.startTime || '21:15',
        endTime: task2.endTime || '22:10',
        title: `Exam Practice: ${sub2.subject.name} (${topic2.topic.title})`,
        type: 'study',
        isFixed: false,
        associatedTaskId: task2.id,
      });
    }

    // Short Python maintenance session (15 mins only during exam mode)
    const pyTask: ScheduledTask = {
      id: `task_py_maint_${targetDate}`,
      date: targetDate,
      title: 'Python Maintenance Sprint (Code Syntax Drill)',
      type: 'python',
      priority: 'low',
      estimatedMinutes: 15,
      actualMinutes: 0,
      status: 'pending',
      startTime: isDrivingActive ? '22:15' : '21:20',
      endTime: isDrivingActive ? '22:30' : '21:35',
      suggestedMethod: 'Quick problem-solving exercise to retain syntax while prioritizing exams.',
      completionCriteria: 'Pass 1 Python coding challenge.',
      reasonSelected: 'Maintenance target kept lean to preserve exam focus.',
    };
    tasks.push(pyTask);

    timetable.push({
      id: `block_py_${targetDate}`,
      startTime: pyTask.startTime || '22:15',
      endTime: pyTask.endTime || '22:30',
      title: 'Python Syntax Drill (Maintenance)',
      type: 'python',
      isFixed: false,
      associatedTaskId: pyTask.id,
    });
  } else if (activeMode === 'free_lecture') {
    recommendationReason =
      'Early Return / Free Lecture Mode: Extra study window available (16:15–19:45). Allocated deep work for challenging topics and full Python practice.';

    // Slot 1: 16:30 - 17:30 (Deep Engineering Subject 1)
    // Slot 2: 17:45 - 18:45 (Engineering Subject 2)
    // Slot 3: 19:00 - 19:45 (Python Full Session)
    // Slot 4: 21:15 - 22:00 (Night Quick Review)
    const sub1 = subjectRankings[0];
    const sub2 = subjectRankings[1] || subjectRankings[0];
    const topic1 = sub1?.allTopics.find((t) => t.topic.status !== 'mastered') || sub1?.allTopics[0];
    const topic2 = sub2?.allTopics.find((t) => t.topic.status !== 'mastered') || sub2?.allTopics[0];

    if (sub1 && topic1) {
      const task1: ScheduledTask = {
        id: `task_free_1_${targetDate}`,
        date: targetDate,
        title: `${sub1.subject.name} — ${topic1.topic.title}`,
        subjectId: sub1.subject.id,
        subjectName: sub1.subject.name,
        topicId: topic1.topic.id,
        topicTitle: topic1.topic.title,
        type: 'engineering',
        priority: 'high',
        estimatedMinutes: 50,
        actualMinutes: 0,
        status: 'pending',
        startTime: '16:30',
        endTime: '17:20',
        suggestedMethod: 'Concept breakdown + solving 5 textbook problems.',
        completionCriteria: 'Finish notes and verify 5 solutions.',
        reasonSelected: `Deep study window gained from early return for highest priority subject.`,
      };
      tasks.push(task1);

      timetable.push({
        id: `block_free_1_${targetDate}`,
        startTime: '16:30',
        endTime: '17:20',
        title: `${sub1.subject.name}: ${topic1.topic.title}`,
        type: 'study',
        isFixed: false,
        associatedTaskId: task1.id,
      });
    }

    if (sub2 && topic2) {
      const task2: ScheduledTask = {
        id: `task_free_2_${targetDate}`,
        date: targetDate,
        title: `${sub2.subject.name} — ${topic2.topic.title}`,
        subjectId: sub2.subject.id,
        subjectName: sub2.subject.name,
        topicId: topic2.topic.id,
        topicTitle: topic2.topic.title,
        type: 'engineering',
        priority: 'medium',
        estimatedMinutes: 45,
        actualMinutes: 0,
        status: 'pending',
        startTime: '17:35',
        endTime: '18:20',
        suggestedMethod: 'Active recall and formula synthesis.',
        completionCriteria: 'Derive key formulas on paper.',
        reasonSelected: `Rotating second engineering priority subject.`,
      };
      tasks.push(task2);

      timetable.push({
        id: `block_free_2_${targetDate}`,
        startTime: '17:35',
        endTime: '18:20',
        title: `${sub2.subject.name}: ${topic2.topic.title}`,
        type: 'study',
        isFixed: false,
        associatedTaskId: task2.id,
      });
    }

    // Python Session: 18:35 - 19:20 (45 mins)
    const pyTask: ScheduledTask = {
      id: `task_py_free_${targetDate}`,
      date: targetDate,
      title: 'Python Coding & Project Roadmap Exercise',
      type: 'python',
      priority: 'high',
      estimatedMinutes: profile.pythonDailyMinutesTarget || 40,
      actualMinutes: 0,
      status: 'pending',
      startTime: '18:35',
      endTime: '19:20',
      suggestedMethod: 'Hands-on code execution: complete module coding exercises and test edge cases.',
      completionCriteria: 'Pass exercise test cases and record progress.',
      reasonSelected: 'Uninterrupted early-evening slot dedicated to software & AI developer roadmap.',
    };
    tasks.push(pyTask);

    timetable.push({
      id: `block_py_free_${targetDate}`,
      startTime: '18:35',
      endTime: '19:20',
      title: 'Python Practice & Coding Exercise',
      type: 'python',
      isFixed: false,
      associatedTaskId: pyTask.id,
    });
  } else {
    // Normal College Mode (Default)
    recommendationReason =
      'Normal College Mode: Protecting your 10:15–17:15 college hours and 20:00–21:00 driving class. Balanced 2 core engineering subjects + 35 min Python practice.';

    // Slot 1: Evening 18:45 - 19:40 (Primary Subject, ~50 mins)
    // Driving class: 20:00 - 21:00
    // Slot 2: Night 21:20 - 22:00 (Python Practice, ~40 mins)
    // Slot 3: Night 22:05 - 22:45 (Secondary Subject Review, ~40 mins)
    const sub1 = subjectRankings[0];
    const sub2 = subjectRankings[1] || subjectRankings[0];
    const topic1 = sub1?.allTopics.find((t) => t.topic.status !== 'mastered') || sub1?.allTopics[0];
    const topic2 = sub2?.allTopics.find((t) => t.topic.status !== 'mastered') || sub2?.allTopics[0];

    if (sub1 && topic1) {
      const task1: ScheduledTask = {
        id: `task_norm_1_${targetDate}`,
        date: targetDate,
        title: `${sub1.subject.name} — ${topic1.topic.title}`,
        subjectId: sub1.subject.id,
        subjectName: sub1.subject.name,
        topicId: topic1.topic.id,
        topicTitle: topic1.topic.title,
        type: 'engineering',
        priority: 'high',
        estimatedMinutes: 45,
        actualMinutes: 0,
        status: 'pending',
        startTime: '18:45',
        endTime: '19:30',
        suggestedMethod: 'Active recall: study theory for 15 mins, solve 3 problems independently for 30 mins.',
        completionCriteria: 'Derive formula without looking and solve 3 numerical problems independently.',
        reasonSelected: `Highest urgency ranking among your 5 subjects (Confidence: ${topic1.topic.confidence}/5).`,
      };
      tasks.push(task1);

      timetable.push({
        id: `block_norm_1_${targetDate}`,
        startTime: '18:45',
        endTime: '19:30',
        title: `${sub1.subject.name}: ${topic1.topic.title}`,
        type: 'study',
        isFixed: false,
        associatedTaskId: task1.id,
      });
    }

    // Python Session: After Driving Class or early evening
    const pyStart = isDrivingActive ? '21:15' : '19:40';
    const pyEnd = isDrivingActive ? '21:50' : '20:15';

    const pyTask: ScheduledTask = {
      id: `task_py_norm_${targetDate}`,
      date: targetDate,
      title: 'Python Roadmap: Core Concept & Coding Exercise',
      type: 'python',
      priority: 'high',
      estimatedMinutes: profile.pythonDailyMinutesTarget || 35,
      actualMinutes: 0,
      status: 'pending',
      startTime: pyStart,
      endTime: pyEnd,
      suggestedMethod: 'Read lesson concept, type code in interactive sandbox, and verify expected output.',
      completionCriteria: 'Successfully run and solve the lesson exercise.',
      reasonSelected: 'Daily skill progression towards AI software development.',
    };
    tasks.push(pyTask);

    timetable.push({
      id: `block_py_norm_${targetDate}`,
      startTime: pyStart,
      endTime: pyEnd,
      title: 'Python Path: Concept & Hands-On Practice',
      type: 'python',
      isFixed: false,
      associatedTaskId: pyTask.id,
    });

    if (sub2 && topic2) {
      const sub2Start = isDrivingActive ? '21:55' : '20:30';
      const sub2End = isDrivingActive ? '22:35' : '21:10';

      const task2: ScheduledTask = {
        id: `task_norm_2_${targetDate}`,
        date: targetDate,
        title: `${sub2.subject.name} — ${topic2.topic.title}`,
        subjectId: sub2.subject.id,
        subjectName: sub2.subject.name,
        topicId: topic2.topic.id,
        topicTitle: topic2.topic.title,
        type: 'revision',
        priority: 'medium',
        estimatedMinutes: 40,
        actualMinutes: 0,
        status: 'pending',
        startTime: sub2Start,
        endTime: sub2End,
        suggestedMethod: 'Spaced review: summarize key points on index card and practice 2 numericals.',
        completionCriteria: 'Verify concept notes and write out summary formulas.',
        reasonSelected: `Subject rotation: ensuring ${sub2.subject.name} receives consistent weekly attention.`,
      };
      tasks.push(task2);

      timetable.push({
        id: `block_norm_2_${targetDate}`,
        startTime: sub2Start,
        endTime: sub2End,
        title: `${sub2.subject.name}: ${topic2.topic.title}`,
        type: 'study',
        isFixed: false,
        associatedTaskId: task2.id,
      });
    }
  }

  // Add Evening Habit / Review task
  const reviewTask: ScheduledTask = {
    id: `task_review_${targetDate}`,
    date: targetDate,
    title: 'Daily Review & Tomorrow Blueprint',
    type: 'review',
    priority: 'medium',
    estimatedMinutes: 10,
    actualMinutes: 0,
    status: 'pending',
    startTime: '22:40',
    endTime: '22:50',
    suggestedMethod: 'Reflect on planned vs actual study time, check off completed habits, and set tomorrow’s priorities.',
    completionCriteria: 'Complete end-of-day reflection review in NEXUS Daily OS.',
    reasonSelected: 'Essential for adaptive learning feedback loop and habit consistency.',
  };
  tasks.push(reviewTask);

  // Sort timetable blocks chronologically
  timetable.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  return {
    timetable,
    tasks,
    recommendationReason,
  };
}
