/* ══════════════════════════════════════════════
   components/Result.tsx
   성향 분석 결과 컴포넌트
   ══════════════════════════════════════════════ */

import type { AnalysisResult } from '../types';
import './Result.css';

interface ResultProps {
  result: AnalysisResult;
  onRetry: () => void;
}

export default function Result({ result, onRetry }: ResultProps) {
  const { typeData, axisScores } = result;

  // 축별 점수를 퍼센트로 변환 (-6 ~ +6 범위를 0 ~ 100으로)
  const normalizeScore = (score: number) => {
    return ((score + 6) / 12) * 100;
  };

  const axisLabels = {
    plan: { left: '즉흥형', right: '계획형' },
    adventure: { left: '안전추구', right: '모험추구' },
    active: { left: '휴식형', right: '활동형' },
    social: { left: '독립형', right: '사교형' },
  };

  return (
    <div className="result-container">
      {/* Type Card */}
      <div className="result-card" style={{ borderColor: typeData.color }}>
        <div className="result-emoji">{typeData.emoji}</div>
        <h1 className="result-title">{typeData.name}</h1>
        <p className="result-subtitle">{typeData.sub}</p>
        <p className="result-description">{typeData.desc}</p>

        {/* Tags */}
        <div className="result-tags">
          {typeData.tags.map((tag) => (
            <span key={tag} className="result-tag" style={{ backgroundColor: typeData.color }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Characteristics */}
      <div className="result-section">
        <h3 className="result-section-title">🎯 주요 특징</h3>
        <ul className="result-list">
          {typeData.characteristics.map((char, index) => (
            <li key={index}>{char}</li>
          ))}
        </ul>
      </div>

      {/* Axis Scores */}
      <div className="result-section">
        <h3 className="result-section-title">📊 성향 분석</h3>
        <div className="result-axes">
          {Object.entries(axisScores).map(([axis, score]) => {
            const labels = axisLabels[axis as keyof typeof axisLabels];
            const percentage = normalizeScore(score);
            
            return (
              <div key={axis} className="result-axis">
                <div className="result-axis-labels">
                  <span className="result-axis-label-left">{labels.left}</span>
                  <span className="result-axis-label-right">{labels.right}</span>
                </div>
                <div className="result-axis-bar">
                  <div className="result-axis-center" />
                  <div
                    className="result-axis-fill"
                    style={{
                      width: `${Math.abs(percentage - 50)}%`,
                      left: percentage < 50 ? `${percentage}%` : '50%',
                      backgroundColor: typeData.color,
                    }}
                  />
                  <div
                    className="result-axis-marker"
                    style={{
                      left: `${percentage}%`,
                      backgroundColor: typeData.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="result-section">
        <h3 className="result-section-title">✨ 추천 여행 스타일</h3>
        
        <div className="result-rec-category">
          <h4>🏛 추천 관광지</h4>
          <div className="result-rec-items">
            {typeData.rec.attraction.map((item, index) => (
              <span key={index} className="result-rec-item">{item}</span>
            ))}
          </div>
        </div>

        <div className="result-rec-category">
          <h4>🏨 추천 숙소</h4>
          <div className="result-rec-items">
            {typeData.rec.accommodation.map((item, index) => (
              <span key={index} className="result-rec-item">{item}</span>
            ))}
          </div>
        </div>

        <div className="result-rec-category">
          <h4>🎯 추천 액티비티</h4>
          <div className="result-rec-items">
            {typeData.rec.activity.map((item, index) => (
              <span key={index} className="result-rec-item">{item}</span>
            ))}
          </div>
        </div>

        <div className="result-rec-category">
          <h4>☕ 추천 카페</h4>
          <div className="result-rec-items">
            {typeData.rec.cafe.map((item, index) => (
              <span key={index} className="result-rec-item">{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button className="result-btn result-btn-secondary" onClick={onRetry}>
          🔄 다시 테스트하기
        </button>
        <button className="result-btn result-btn-primary" style={{ backgroundColor: typeData.color }}>
          🗺️ 맞춤 여행 계획하기
        </button>
      </div>
    </div>
  );
}
