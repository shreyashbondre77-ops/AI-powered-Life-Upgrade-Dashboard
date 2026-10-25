import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, BookOpen, Star } from 'lucide-react';
import { Subject, StudySession } from '../types/nexus';
import { getCurrentTimeString, getTodayDateString } from '../utils/dateUtils';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialSubjectId?: string;
  initialTopicTitle?: string;
  onSessionComplete: (session: StudySession) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialSubjectId,
  initialTopicTitle,
  onSessionComplete,
}) => {
  const [targetMinutes, setTargetMinutes] = useState<number>(45);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<string>('');

  // Association
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || subjects[0]?.id || '');
  const [topicTitle, setTopicTitle] = useState<string>(initialTopicTitle || '');
  const [sessionType, setSessionType] = useState<'engineering' | 'python' | 'revision' | 'mock_exam'>('engineering');

  // Post-session reflection state
  const [isReflecting, setIsReflecting] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(4);
  const [reflectionNotes, setReflectionNotes] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play browser audio tone on completion
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  useEffect(() => {
    if (initialSubjectId) setSelectedSubjectId(initialSubjectId);
    if (initialTopicTitle) setTopicTitle(initialTopicTitle);
  }, [initialSubjectId, initialTopicTitle]);

  useEffect(() => {
    if (isRunning) {
      if (!sessionStartTime) {
        setSessionStartTime(getCurrentTimeString());
      }
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playChime();
            setIsReflecting(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, sessionStartTime]);

  if (!isOpen) return null;

  const handleSelectMinutes = (mins: number) => {
    setIsRunning(false);
    setTargetMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(targetMinutes * 60);
  };

  const handleEarlyComplete = () => {
    setIsRunning(false);
    setIsReflecting(true);
  };

  const handleSaveSession = () => {
    const elapsedMinutes = Math.max(1, Math.round((targetMinutes * 60 - secondsRemaining) / 60));
    const selectedSub = subjects.find((s) => s.id === selectedSubjectId);

    const newSession: StudySession = {
      id: `session_${Date.now()}`,
      date: getTodayDateString(),
      startTime: sessionStartTime || getCurrentTimeString(),
      endTime: getCurrentTimeString(),
      durationMinutes: elapsedMinutes,
      subjectId: sessionType === 'engineering' ? selectedSubjectId : undefined,
      subjectName: sessionType === 'python' ? 'Python Programming' : selectedSub?.name || 'General Study',
      topicTitle: topicTitle || (sessionType === 'python' ? 'Hands-on Practice' : 'Core Topics Review'),
      type: sessionType,
      reflectionRating: rating,
      reflectionNotes: reflectionNotes.trim() || 'Completed focused study block.',
    };

    onSessionComplete(newSession);
    setIsReflecting(false);
    onClose();
    handleReset();
    setReflectionNotes('');
  };

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const progressPercent = Math.min(100, Math.round(((targetMinutes * 60 - secondsRemaining) / (targetMinutes * 60)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold tracking-tight">
              {isReflecting ? 'Focus Session Reflection' : 'Deep Work Focus Timer'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isReflecting ? (
          /* Post-session Reflection Form */
          <div className="py-4 space-y-4">
            <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-lg text-xs text-indigo-200">
              <span className="font-semibold text-indigo-100">Session Completed: </span>
              {Math.max(1, Math.round((targetMinutes * 60 - secondsRemaining) / 60))} minutes of deep focus.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                How effective was your concentration? (1 to 5)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-600 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                What did you achieve or solve? Any key friction points?
              </label>
              <textarea
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="e.g. Derived the characteristic equation and solved 3 eigenvalue numericals. Need to review row transformations for 3x3 matrices."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsReflecting(false);
                  handleReset();
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 rounded-md"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveSession}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-sm"
              >
                Save to Study Records
              </button>
            </div>
          </div>
        ) : (
          /* Active Timer View */
          <div className="py-6 space-y-6">
            {/* Target Preset Buttons */}
            <div className="flex items-center justify-center gap-2">
              {[25, 45, 60, 90].map((m) => (
                <button
                  key={m}
                  onClick={() => handleSelectMinutes(m)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    targetMinutes === m
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>

            {/* Circular Timer Display */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-slate-100 tabular-nums">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
              <div className="w-48 bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 mt-2 font-mono tabular-nums">
                {progressPercent}% elapsed
              </span>
            </div>

            {/* Session Association Selectors */}
            <div className="space-y-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Session Type</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200"
                  >
                    <option value="engineering">Engineering Subject</option>
                    <option value="python">Python Programming</option>
                    <option value="revision">Active Recall / Revision</option>
                    <option value="mock_exam">Timed Mock Exam</option>
                  </select>
                </div>

                {sessionType !== 'python' && (
                  <div>
                    <label className="block text-slate-400 mb-1">Engineering Subject</label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 truncate"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Specific Topic or Chapter</label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="e.g. Eigenvalues and Eigenvectors Practice"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                title="Reset timer"
                className="p-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{secondsRemaining < targetMinutes * 60 ? 'Resume' : 'Start Focus'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleEarlyComplete}
                title="Complete & log session"
                className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/50 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
