/* ══════════════════════════════════════════════
   utils/personalityAnalyzer.ts
   여행 성향 분석 알고리즘 - React Native 버전
   ══════════════════════════════════════════════ */

import questionsData from '../data/personalityQuestions.json';
import typesData from '../data/personalityTypes.json';

export type AxisType = 'plan' | 'adventure' | 'active' | 'social' | 'value' | 'stability';

export type ScoreKey = 
  | 'plan' 
  | 'spontaneous' 
  | 'adventure' 
  | 'safe' 
  | 'active' 
  | 'rest' 
  | 'social' 
  | 'solo' 
  | 'healing' 
  | 'aesthetic' 
  | 'food' 
  | 'nature' 
  | 'easygoing';

export type TravelTypeKey = 
  | 'master_planner'
  | 'free_spirit'
  | 'cozy_healer'
  | 'trend_setter'
  | 'action_seeker'
  | 'local_gourmet'
  | 'easy_going'
  | 'lone_wanderer';

export interface QuizOption {
  label: string;
  value: string;
  scores: Partial<Record<ScoreKey, number>>;
}

export interface QuizQuestion {
  id: string;
  axis: AxisType;
  category: string;
  question: string;
  type: 'single' | 'multiple';
  options: QuizOption[];
}

export interface TravelTypeRecommendations {
  attraction: string[];
  accommodation: string[];
  activity: string[];
  cafe: string[];
}

export interface TravelType {
  key: TravelTypeKey;
  emoji: string;
  name: string;
  sub: string;
  desc: string;
  tags: string[];
  rec: TravelTypeRecommendations;
  color: string;
  psychologicalBasis: string;
  characteristics: string[];
}

export interface AnalysisScores {
  plan: number;
  spontaneous: number;
  adventure: number;
  safe: number;
  active: number;
  rest: number;
  social: number;
  solo: number;
  healing: number;
  aesthetic: number;
  food: number;
  nature: number;
  easygoing: number;
}

export interface AnalysisResult {
  type: TravelTypeKey;
  typeData: TravelType;
  scores: AnalysisScores;
  axisScores: {
    plan: number;
    adventure: number;
    active: number;
    social: number;
  };
}

export interface UserAnswers {
  [questionId: string]: string;
}

const questions: QuizQuestion[] = questionsData as QuizQuestion[];
const travelTypes: Record<TravelTypeKey, TravelType> = typesData as Record<TravelTypeKey, TravelType>;

/**
 * 사용자 답변을 기반으로 여행 성향 분석
 */
export function analyzePersonality(answers: UserAnswers): AnalysisResult {
  // 1. 점수 집계
  const scores = calculateScores(answers);
  
  // 2. 여행 유형 판별
  const travelType = determineTravelType(scores);
  
  // 3. 축별 점수 계산
  const axisScores = calculateAxisScores(scores);
  
  return {
    type: travelType,
    typeData: travelTypes[travelType],
    scores,
    axisScores,
  };
}

/**
 * 답변을 기반으로 각 특성별 점수 계산
 */
function calculateScores(answers: UserAnswers): AnalysisScores {
  const scores: AnalysisScores = {
    plan: 0,
    spontaneous: 0,
    adventure: 0,
    safe: 0,
    active: 0,
    rest: 0,
    social: 0,
    solo: 0,
    healing: 0,
    aesthetic: 0,
    food: 0,
    nature: 0,
    easygoing: 0,
  };

  // 각 질문의 답변에 따라 점수 합산
  questions.forEach((question) => {
    const answer = answers[question.id];
    if (!answer) return;

    const selectedOption = question.options.find(opt => opt.value === answer);
    if (!selectedOption) return;

    // 선택지의 점수를 합산
    Object.entries(selectedOption.scores).forEach(([key, value]) => {
      if (key in scores) {
        scores[key as keyof AnalysisScores] += value;
      }
    });
  });

  return scores;
}

/**
 * 점수를 기반으로 여행 유형 판별
 */
function determineTravelType(scores: AnalysisScores): TravelTypeKey {
  // 축별 점수 계산
  const planScore = scores.plan - scores.spontaneous;
  const adventureScore = scores.adventure - scores.safe;
  const activeScore = scores.active - scores.rest;
  const socialScore = scores.social - scores.solo;

  // 우선순위 규칙 적용
  // 1. Easy-Going: 순응적이고 사교적
  if (scores.easygoing >= 2 && socialScore >= 1) {
    return 'easy_going';
  }

  // 2. Lone Wanderer: 독립적이고 모험적
  if (scores.solo >= 3 && adventureScore >= 1) {
    return 'lone_wanderer';
  }

  // 3. Local Gourmet: 음식 중심, 모험적
  if (scores.food >= 3 && adventureScore >= 1) {
    return 'local_gourmet';
  }

  // 4. Action Seeker: 활동적이고 모험적
  if (activeScore >= 3 && adventureScore >= 2) {
    return 'action_seeker';
  }

  // 5. Trend Setter: 감성적, 심미적
  if (scores.aesthetic >= 3) {
    return 'trend_setter';
  }

  // 6. Cozy Healer: 힐링 중심, 휴식 선호
  if (scores.healing >= 3 && planScore >= 0) {
    return 'cozy_healer';
  }

  // 7. Free Spirit: 모험적이고 즉흥적
  if (adventureScore >= 3 && planScore < 0) {
    return 'free_spirit';
  }

  // 8. Master Planner: 계획적
  if (planScore >= 3) {
    return 'master_planner';
  }

  // 기본: 가장 높은 점수의 유형 선택
  const typeScores: Record<TravelTypeKey, number> = {
    master_planner: scores.plan * 2 + scores.safe,
    free_spirit: scores.spontaneous * 2 + scores.adventure,
    cozy_healer: scores.healing * 2 + scores.rest,
    trend_setter: scores.aesthetic * 2,
    action_seeker: scores.active * 2 + scores.adventure,
    local_gourmet: scores.food * 2 + scores.adventure,
    easy_going: scores.easygoing * 2 + scores.social,
    lone_wanderer: scores.solo * 2 + scores.adventure,
  };

  // 최고 점수 유형 반환
  return Object.entries(typeScores).reduce((max, [key, value]) => 
    value > typeScores[max] ? key as TravelTypeKey : max,
    'master_planner' as TravelTypeKey
  );
}

/**
 * 축별 점수 계산 (시각화용)
 */
function calculateAxisScores(scores: AnalysisScores) {
  return {
    plan: scores.plan - scores.spontaneous,
    adventure: scores.adventure - scores.safe,
    active: scores.active - scores.rest,
    social: scores.social - scores.solo,
  };
}

/**
 * 질문 데이터 가져오기
 */
export function getQuestions(): QuizQuestion[] {
  return questions;
}

/**
 * 여행 유형 데이터 가져오기
 */
export function getTravelTypes(): Record<TravelTypeKey, TravelType> {
  return travelTypes;
}

/**
 * 특정 여행 유형 데이터 가져오기
 */
export function getTravelType(key: TravelTypeKey): TravelType {
  return travelTypes[key];
}
