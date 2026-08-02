import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_QUIZ_QUESTIONS } from '../data/initialData';
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award
} from 'lucide-react';

export const DailyQuizModule: React.FC = () => {
  const { isDailyQuizOpen, setIsDailyQuizOpen, showToast } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isDailyQuizOpen) return null;

  const currentQuestion = INITIAL_QUIZ_QUESTIONS[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < INITIAL_QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    let score = 0;
    INITIAL_QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score += 1;
      }
    });
    showToast(`Quiz Submitted! Score: ${score} / ${INITIAL_QUIZ_QUESTIONS.length}`);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIndex(0);
  };

  let scoreCount = 0;
  if (isSubmitted) {
    INITIAL_QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) scoreCount += 1;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-obsidian-900 rounded-3xl shadow-neon-red-lg border border-cyberRed-800/60 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-cyberRed-950 via-cyberRed-900 to-obsidian-950 text-white flex items-center justify-between border-b border-cyberRed-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyberRed-950 rounded-2xl border border-cyberRed-800 shadow-neon-red">
              <Sparkles className="h-6 w-6 text-cyberRed-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-cyberRed-950 px-2 py-0.5 rounded-md text-cyberRed-400 border border-cyberRed-800">
                Group B • Foundation Method
              </span>
              <h2 className="text-xl font-black text-white">Daily Concept Quiz (5-Question Reinforcement)</h2>
            </div>
          </div>

          <button
            onClick={() => setIsDailyQuizOpen(false)}
            className="p-1.5 rounded-full bg-obsidian-950 hover:bg-obsidian-800 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {isSubmitted ? (
            /* Results Screen */
            <div className="text-center py-6 space-y-6">
              <div className="h-20 w-20 mx-auto rounded-full bg-cyberRed-950 flex items-center justify-center text-cyberRed-400 border-4 border-cyberRed-800 shadow-neon-red">
                <Award className="h-10 w-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Quiz Completed!</h3>
                <p className="text-sm font-black text-cyberRed-400 mt-1">
                  Your Score: {scoreCount} / {INITIAL_QUIZ_QUESTIONS.length} ({Math.round((scoreCount / INITIAL_QUIZ_QUESTIONS.length) * 100)}%)
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Continuous retrieval practice strengthens long-term concept memory.
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 text-left max-h-60 overflow-y-auto p-4 rounded-2xl bg-obsidian-950 border border-slate-800">
                {INITIAL_QUIZ_QUESTIONS.map((q, idx) => {
                  const isCorrect = selectedAnswers[idx] === q.correctAnswer;
                  return (
                    <div key={q.id} className="p-3 rounded-xl bg-obsidian-900 border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-start justify-between font-bold text-white">
                        <span>Q{idx + 1}: {q.question}</span>
                        {isCorrect ? (
                          <span className="text-emerald-400 flex items-center gap-1 shrink-0"><CheckCircle2 className="h-4 w-4" /> Correct</span>
                        ) : (
                          <span className="text-cyberRed-500 flex items-center gap-1 shrink-0"><XCircle className="h-4 w-4" /> Incorrect</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px]">Explanation: {q.explanation}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleResetQuiz}
                  className="px-5 py-2.5 rounded-2xl bg-cyberRed-600 hover:bg-cyberRed-500 text-white text-xs font-black flex items-center gap-2 shadow-neon-red"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake Quiz
                </button>
                <button
                  onClick={() => setIsDailyQuizOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-obsidian-950 text-slate-300 text-xs font-bold border border-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Question Screen */
            <div className="space-y-6">
              
              {/* Question Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Question {currentIndex + 1} of {INITIAL_QUIZ_QUESTIONS.length}</span>
                  <span className="text-cyberRed-400 font-black">{currentQuestion.difficulty} Level</span>
                </div>
                <div className="h-2 w-full bg-obsidian-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-cyberRed-600 rounded-full transition-all shadow-neon-red"
                    style={{ width: `${((currentIndex + 1) / INITIAL_QUIZ_QUESTIONS.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Box */}
              <div className="space-y-4">
                <h3 className="text-base font-black text-white leading-relaxed">
                  {currentQuestion.question}
                </h3>

                {/* Options */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentIndex] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-4 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-cyberRed-500 bg-cyberRed-950/60 text-white shadow-neon-red ring-2 ring-cyberRed-500/40'
                            : 'border-slate-800 bg-obsidian-950 text-slate-300 hover:border-cyberRed-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                              isSelected ? 'bg-cyberRed-600 text-white' : 'bg-obsidian-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{option}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-cyberRed-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-400 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentIndex === INITIAL_QUIZ_QUESTIONS.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswers[currentIndex] === undefined}
                    className="px-6 py-2.5 rounded-2xl bg-cyberRed-600 hover:bg-cyberRed-500 text-white text-xs font-black shadow-neon-red disabled:opacity-50"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={selectedAnswers[currentIndex] === undefined}
                    className="px-5 py-2.5 rounded-2xl bg-cyberRed-950 hover:bg-cyberRed-900 text-cyberRed-400 border border-cyberRed-800 text-xs font-black disabled:opacity-50"
                  >
                    Next Question
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
