/* ══════════════════════════════════════════════
   types/personalityTypes.ts
   여행 성향 분석 타입 정의 (AI 프로젝트 이식)
   ══════════════════════════════════════════════ */

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
