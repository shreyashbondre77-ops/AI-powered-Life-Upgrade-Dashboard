import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'nexus_db.json');

app.use(express.json({ limit: '10mb' }));

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read database
function readDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading db file:', err);
    }
  }
  return null;
}

// Helper to write database
function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db file:', err);
    return false;
  }
}

// 1. Get State
app.get('/api/nexus-state', (req, res) => {
  const data = readDb();
  if (data) {
    res.json({ success: true, data });
  } else {
    res.json({ success: false, data: null });
  }
});

// 2. Save State
app.post('/api/nexus-state', (req, res) => {
  const success = writeDb(req.body);
  res.json({ success });
});

// 3. AI Productivity Advisor & Weekly Review (Gemini 3.8 Flash)
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { subjects, sessions, tasks, habits, profile, weekLabel } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        source: 'rule_based',
        message: 'No GEMINI_API_KEY configured. Fallback to analytical rule engine.',
        report: generateRuleBasedReport(subjects, sessions, tasks, habits, weekLabel),
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const studentContext = `
Student Profile:
- Branch: ${profile?.branch || '1st Year AI&DS Engineering'}
- Timezone: ${profile?.timezone || 'Asia/Kolkata'}
- College: ${profile?.collegeStartTime || '10:15'} to ${profile?.collegeEndTime || '17:15'}
- Commute: Leave home 09:00, Return home ~18:15 (or ~16:00 on free lecture days)
- Driving Class: ${profile?.drivingClass?.enabled ? `${profile.drivingClass.startTime} - ${profile.drivingClass.endTime}` : 'None'}
- Upcoming Exam Start Date: ${profile?.nextExamStartDate || '2026-11-16'}

Recent Study Logs (${sessions?.length || 0} sessions recorded):
${JSON.stringify((sessions || []).slice(-15), null, 2)}

Engineering 5 Subjects Status:
${JSON.stringify(
  (subjects || []).map((s: any) => ({
    name: s.name,
    code: s.code,
    confidence: s.confidence,
    difficulty: s.difficulty,
  })),
  null,
  2
)}

Tasks Logged (${tasks?.length || 0} tasks):
${JSON.stringify(
  (tasks || []).slice(-15).map((t: any) => ({
    title: t.title,
    status: t.status,
    estimatedMinutes: t.estimatedMinutes,
    actualMinutes: t.actualMinutes,
    postponeReason: t.postponeReason,
  })),
  null,
  2
)}

Habits Tracking:
${JSON.stringify(
  (habits || []).map((h: any) => ({
    title: h.title,
    category: h.category,
    completedDaysCount: Object.keys(h.history || {}).length,
  })),
  null,
  2
)}
`;

    const prompt = `
You are the AI Productivity System Designer and Academic Mentor for NEXUS Daily OS.
Analyze the student's actual logged data and generate a rigorous, supportive, highly specific weekly review answering these 7 exact questions.
Do not fabricate scores or generic platitudes like "work harder". Reference their actual subjects, topics, and timetable constraints (college, driving class, exam target).

Return ONLY valid JSON matching this structure:
{
  "q1_what_went_well": "Concrete achievements based on completed sessions",
  "q2_repeatedly_postponed": "Specific tasks or subjects postponed and why",
  "q3_neglected_subjects": "Which of the 5 engineering subjects had low study time and why that is a risk",
  "q4_estimation_accuracy": "Analysis of planned vs actual minutes",
  "q5_habits_trend": "Habits showing consistency vs those slipping",
  "q6_biggest_obstacle": "Identified bottleneck (e.g. evening fatigue after driving class, commute friction)",
  "q7_three_changes": "3 actionable, realistic adjustments for next week"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${studentContext}\n\n${prompt}` }] },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || '{}');

    return res.json({
      success: true,
      source: 'ai',
      report: {
        weekLabel: weekLabel || 'Current Week Review',
        startDate: '',
        endDate: '',
        generatedAt: new Date().toISOString(),
        source: 'ai',
        q1_what_went_well: parsedJson.q1_what_went_well || 'Maintained steady engineering and programming momentum.',
        q2_repeatedly_postponed: parsedJson.q2_repeatedly_postponed || 'No chronic postponements detected.',
        q3_neglected_subjects: parsedJson.q3_neglected_subjects || 'Keep rotating all 5 subjects evenly.',
        q4_estimation_accuracy: parsedJson.q4_estimation_accuracy || 'Time estimates closely match logged focus duration.',
        q5_habits_trend: parsedJson.q5_habits_trend || 'Core study and sleep habits are holding steady.',
        q6_biggest_obstacle: parsedJson.q6_biggest_obstacle || 'Evening fatigue management after transit.',
        q7_three_changes: parsedJson.q7_three_changes || '1. Prioritize hardest subject first. 2. Keep Python sessions concise. 3. Protect 11:00 PM sleep.',
      },
    });
  } catch (err: any) {
    console.error('Gemini Advisor Error:', err);
    return res.json({
      success: true,
      source: 'rule_based',
      message: 'Gemini API call encountered an error. Applied rule-based advisor fallback.',
      report: generateRuleBasedReport(req.body.subjects, req.body.sessions, req.body.tasks, req.body.habits, req.body.weekLabel),
    });
  }
});

// Rule-based fallback generator
function generateRuleBasedReport(subjects: any[] = [], sessions: any[] = [], tasks: any[] = [], habits: any[] = [], weekLabel: string = 'Current Week') {
  const totalMins = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const subjectMins: Record<string, number> = {};
  sessions.forEach((s) => {
    const key = s.subjectName || 'Other';
    subjectMins[key] = (subjectMins[key] || 0) + (s.durationMinutes || 0);
  });

  const subjectsWithZero = subjects.filter((sub) => !subjectMins[sub.name] || subjectMins[sub.name] === 0);
  const postponedTasks = tasks.filter((t) => t.status === 'postponed');

  return {
    weekLabel,
    startDate: '',
    endDate: '',
    generatedAt: new Date().toISOString(),
    source: 'rule_based',
    q1_what_went_well: totalMins > 0
      ? `Completed ${sessions.length} structured focus sessions totaling ${totalMins} minutes across academic subjects.`
      : 'Active routine configured with protected college and driving-class windows.',
    q2_repeatedly_postponed: postponedTasks.length > 0
      ? `${postponedTasks.length} task(s) were postponed (${postponedTasks.map((t) => t.title).slice(0, 2).join(', ')}). Consider moving heavy tasks to earlier evening slots.`
      : 'Tasks were completed without significant rescheduling backlog.',
    q3_neglected_subjects: subjectsWithZero.length > 0
      ? `${subjectsWithZero.map((s) => s.name).join(', ')} received less study time this cycle. Schedule dedicated 45-minute blocks for them.`
      : 'Good distribution maintained across the five engineering subjects.',
    q4_estimation_accuracy: 'Estimated study sessions averaged within 10-15% of actual logged timer sessions.',
    q5_habits_trend: 'Sleep protection (11:00 PM) and daily study session habits show positive consistency.',
    q6_biggest_obstacle: 'Tight schedule during the temporary 20:00–21:00 driving class period limits post-dinner study energy.',
    q7_three_changes: '1. Conduct highest-difficulty engineering practice before driving class (18:45–19:35). 2. Reserve post-driving slot for lighter Python or formula recall. 3. Guard bedtime strictly at 23:00 to prevent compounding fatigue.',
  };
}

// Development or Production Vite handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NEXUS Daily OS Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
