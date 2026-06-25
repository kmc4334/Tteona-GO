/* ══════════════════════════════════════════════
   App.tsx
   여행 성향 분석 메인 앱
   ══════════════════════════════════════════════ */

import { useState } from 'react';
import Quiz from './components/Quiz';
import Result from './components/Result';
import { analyzePersonality } from './utils/analyzer';
import type { UserAnswers, AnalysisResult } from './types';
import './App.css';

type AppState = 'intro' | 'quiz' | 'result';

function App() {
  const [state, setState] = useState<AppState>('intro');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleStart = () => {
    setState('quiz');
  };

  const handleComplete = (answers: UserAnswers) => {
    const analysisResult = analyzePersonality(answers);
    setResult(analysisResult);
    setState('result');
  };

  const handleRetry = () => {
    setResult(null);
    setState('intro');
  };

  return (
    <div className="app">
      <main className="app-main">
        {state === 'intro' && (
          <div className="intro-container">
            <div className="intro-card">
              <div className="intro-icon">✈️</div>
              <h2 className="intro-title">당신의 여행 스타일은?</h2>
              <p className="intro-description">
                12가지 질문으로 알아보는 나의 여행 성향
                <br />
                8가지 유형 중 당신에게 딱 맞는 여행 스타일을 찾아드립니다
              </p>
              
              <div className="intro-features">
                <div className="intro-feature">
                  <span className="intro-feature-icon">🎯</span>
                  <span>12문항 성향 테스트</span>
                </div>
                <div className="intro-feature">
                  <span className="intro-feature-icon">🗺️</span>
                  <span>8가지 여행 유형</span>
                </div>
                <div className="intro-feature">
                  <span className="intro-feature-icon">✨</span>
                  <span>맞춤형 추천</span>
                </div>
              </div>

              <button className="intro-btn" onClick={handleStart}>
                시작하기 →
              </button>

              <p className="intro-time">⏱️ 소요 시간: 약 3분</p>
            </div>
          </div>
        )}

        {state === 'quiz' && <Quiz onComplete={handleComplete} />}

        {state === 'result' && result && (
          <Result result={result} onRetry={handleRetry} />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2026 떠나GO Team</p>
        <p className="footer-source">
          Big Five 성격 이론, Plog의 여행자 성향 이론, Crompton의 여행 동기 이론 기반
        </p>
      </footer>
    </div>
  );
}

export default App;
