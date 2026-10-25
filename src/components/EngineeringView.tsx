import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Search,
  Filter,
  Plus,
  Play,
  Star,
  CheckCircle2,
  Clock,
  FileQuestion,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Edit2,
} from 'lucide-react';
import { Subject, Topic, Unit, Chapter, TopicStatus } from '../types/nexus';

interface EngineeringViewProps {
  subjects: Subject[];
  onUpdateTopic: (subjectId: string, topicId: string, updates: Partial<Topic>) => void;
  onAddTopic: (subjectId: string, unitId: string, chapterId: string, newTopicTitle: string) => void;
  onStartFocusOnTopic: (subjectId: string, topicTitle: string) => void;
}

export const EngineeringView: React.FC<EngineeringViewProps> = ({
  subjects,
  onUpdateTopic,
  onAddTopic,
  onStartFocusOnTopic,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'weak' | 'revision' | 'exam_high'>('all');
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState<boolean>(false);
  const [newTopicName, setNewTopicName] = useState<string>('');
  const [targetUnitId, setTargetUnitId] = useState<string>('');
  const [targetChapterId, setTargetChapterId] = useState<string>('');

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  if (!currentSubject) {
    return <div className="p-8 text-center text-slate-400">No subjects configured.</div>;
  }

  // Flatten all topics for calculations
  const allSubjectTopics: { unit: Unit; chapter: Chapter; topic: Topic }[] = [];
  currentSubject.units.forEach((u) => {
    u.chapters.forEach((c) => {
      c.topics.forEach((t) => {
        allSubjectTopics.push({ unit: u, chapter: c, topic: t });
      });
    });
  });

  const masteredCount = allSubjectTopics.filter((i) => i.topic.status === 'mastered').length;
  const learnedCount = allSubjectTopics.filter((i) => i.topic.status === 'learned').length;
  const revisionCount = allSubjectTopics.filter((i) => i.topic.status === 'needs_revision').length;
  const totalMinsSpent = allSubjectTopics.reduce((acc, i) => acc + (i.topic.timeSpentMinutes || 0), 0);
  const totalPracticeSolved = allSubjectTopics.reduce((acc, i) => acc + (i.topic.practiceSolvedCount || 0), 0);

  // Filter topics based on search & filter tabs
  const filterTopic = (topic: Topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.notes.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'weak') return topic.confidence <= 2;
    if (filterType === 'revision') return topic.status === 'needs_revision';
    if (filterType === 'exam_high') return topic.examRelevance === 'high';
    return true;
  };

  const handleOpenAdd = (unitId: string, chapterId: string) => {
    setTargetUnitId(unitId);
    setTargetChapterId(chapterId);
    setNewTopicName('');
    setIsAddTopicModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    onAddTopic(currentSubject.id, targetUnitId, targetChapterId, newTopicName.trim());
    setIsAddTopicModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* 1. Subject Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {subjects.map((sub) => {
          const isSelected = sub.id === currentSubject.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-4 py-2.5 rounded-xl border text-left shrink-0 transition-all ${
                isSelected
                  ? 'bg-indigo-600/15 border-indigo-500 text-indigo-200 font-semibold shadow-sm'
                  : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-mono text-indigo-400 font-semibold">{sub.code}</div>
              <div className="text-xs font-semibold text-slate-100 truncate max-w-[180px]">
                {sub.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Subject Mastery Overview Header */}
      <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold">
              {currentSubject.code}
            </span>
            <span className="text-xs text-slate-400">
              Exam: {currentSubject.examDate || 'Provisional Nov 16'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            {currentSubject.name}
          </h1>
          <p className="text-xs text-slate-400">
            Mastery is determined by self-assessment, independent practice problems, and recall evidence.
          </p>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Topics Progress</span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
              {masteredCount + learnedCount} <span className="text-xs text-slate-500">/ {allSubjectTopics.length}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Needs Revision</span>
            <div className="text-lg font-bold font-mono text-amber-400 mt-0.5 tabular-nums">
              {revisionCount}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Problems Solved</span>
            <div className="text-lg font-bold font-mono text-indigo-400 mt-0.5 tabular-nums">
              {totalPracticeSolved}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Time Invested</span>
            <div className="text-lg font-bold font-mono text-slate-200 mt-0.5 tabular-nums">
              {totalMinsSpent}m
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search syllabus topics or notes..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'weak', label: 'Weak (<= 2★)' },
            { id: 'revision', label: 'Needs Revision' },
            { id: 'exam_high', label: 'High Exam Relevance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Units & Topics Hierarchy */}
      <div className="space-y-6">
        {currentSubject.units.map((unit) => {
          return (
            <div
              key={unit.id}
              className="p-5 bg-slate-900/50 border border-slate-800/90 rounded-2xl space-y-4"
            >
              {/* Unit Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-semibold block uppercase">
                    Unit {unit.unitNumber}
                  </span>
                  <h3 className="text-base font-bold text-slate-100">{unit.title}</h3>
                </div>
              </div>

              {/* Chapters & Topics */}
              <div className="space-y-4">
                {unit.chapters.map((chapter) => {
                  const filteredChapterTopics = chapter.topics.filter(filterTopic);

                  return (
                    <div key={chapter.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">
                          Chapter: {chapter.title}
                        </span>
                        <button
                          onClick={() => handleOpenAdd(unit.id, chapter.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Topic</span>
                        </button>
                      </div>

                      {/* Topic Rows */}
                      <div className="space-y-2">
                        {filteredChapterTopics.length === 0 ? (
                          <div className="p-3 text-center text-slate-500 text-xs bg-slate-950/40 rounded-lg">
                            No topics match current filter.
                          </div>
                        ) : (
                          filteredChapterTopics.map((topic) => {
                            return (
                              <div
                                key={topic.id}
                                className="p-3.5 bg-slate-950 border border-slate-800/90 rounded-xl space-y-2 text-xs"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-100 text-sm">
                                        {topic.title}
                                      </span>
                                      {topic.examRelevance === 'high' && (
                                        <span className="text-[10px] px-1.5 py-0.2 bg-rose-950 text-rose-300 border border-rose-900/40 rounded font-medium">
                                          High Exam Weight
                                        </span>
                                      )}
                                    </div>
                                    {topic.notes && (
                                      <p className="text-[11px] text-slate-400 italic">
                                        "{topic.notes}"
                                      </p>
                                    )}
                                  </div>

                                  {/* Focus Trigger Button */}
                                  <button
                                    onClick={() =>
                                      onStartFocusOnTopic(currentSubject.id, topic.title)
                                    }
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg font-semibold shrink-0 transition-colors"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>Focus Topic</span>
                                  </button>
                                </div>

                                {/* Controls Row */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-850 text-slate-400">
                                  <div className="flex flex-wrap items-center gap-3">
                                    {/* Status selector */}
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-slate-500">Status:</span>
                                      <select
                                        value={topic.status}
                                        onChange={(e) =>
                                          onUpdateTopic(currentSubject.id, topic.id, {
                                            status: e.target.value as TopicStatus,
                                          })
                                        }
                                        className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-200 text-[11px] font-medium"
                                      >
                                        <option value="not_started">Not Started</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="learned">Learned</option>
                                        <option value="needs_revision">Needs Revision</option>
                                        <option value="mastered">Mastered</option>
                                      </select>
                                    </div>

                                    {/* Confidence Stars */}
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-slate-500">Confidence:</span>
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() =>
                                            onUpdateTopic(currentSubject.id, topic.id, {
                                              confidence: star,
                                            })
                                          }
                                          className="p-0.5 text-slate-600 hover:text-amber-400"
                                        >
                                          <Star
                                            className={`w-3.5 h-3.5 ${
                                              star <= topic.confidence
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-slate-800'
                                            }`}
                                          />
                                        </button>
                                      ))}
                                    </div>

                                    {/* Practice Counter */}
                                    <div className="flex items-center gap-1 font-mono">
                                      <span className="text-[10px] text-slate-500">Solved:</span>
                                      <button
                                        onClick={() =>
                                          onUpdateTopic(currentSubject.id, topic.id, {
                                            practiceSolvedCount: Math.max(0, topic.practiceSolvedCount - 1),
                                          })
                                        }
                                        className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200"
                                      >
                                        -
                                      </button>
                                      <span className="font-bold text-slate-200 tabular-nums px-1">
                                        {topic.practiceSolvedCount}
                                      </span>
                                      <button
                                        onClick={() =>
                                          onUpdateTopic(currentSubject.id, topic.id, {
                                            practiceSolvedCount: topic.practiceSolvedCount + 1,
                                          })
                                        }
                                        className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                                    Time spent: {topic.timeSpentMinutes}m
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Topic Modal */}
      {isAddTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleAddSubmit}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 space-y-4 text-xs"
          >
            <h3 className="text-sm font-bold text-slate-100">Add Topic to Syllabus</h3>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Topic Name</label>
              <input
                type="text"
                required
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="e.g. Diagonalization of Symmetric Matrices"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddTopicModalOpen(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md"
              >
                Add Topic
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
