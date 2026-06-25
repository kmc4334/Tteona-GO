/* ══════════════════════════════════════════════
   components/Quiz.tsx
   성향 분석 퀴즈 컴포넌트
   ══════════════════════════════════════════════ */

import { useState } from 'react';
import type { QuizQuestion, UserAnswers } from '../types';
import { getQuestions } from '../utils/analyzer';
import './Quiz.css';

interface QuizProps {
  onComplete: (answers: UserAnswers) => void;
}

export default function Quiz({ onComplete }: QuizProps) {
  const questions = getQuestions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswer = answers[currentQuestion.id] !== undefined;

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!hasAnswer) return;

    if (isLastQuestion) {
      onComplete(answers);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="quiz-container">
      {/* Progress Bar */}
      <div className="quiz-progress">
        <div className="quiz-progress-bar" style={{ width: `${progress}%` }} />
        <div className="quiz-progress-text">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Question Card */}
      <div className="quiz-card">
        <div className="quiz-category">{currentQuestion.category}</div>
        <h2 className="quiz-question">{currentQuestion.question}</h2>

        {/* Options */}
        <div className="quiz-options">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              className={`quiz-option ${
                answers[currentQuestion.id] === option.value ? 'selected' : ''
              }`}
              onClick={() => handleAnswer(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-navigation">
        <button
          className="quiz-btn quiz-btn-secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ← 이전
        </button>
        <button
          className={`quiz-btn quiz-btn-primary ${!hasAnswer ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={!hasAnswer}
        >
          {isLastQuestion ? '결과 보기' : '다음 →'}
        </button>
      </div>
    </div>
  );
}
