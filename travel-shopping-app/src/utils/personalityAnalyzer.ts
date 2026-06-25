/* ══════════════════════════════════════════════
   utils/personalityAnalyzer.ts
   여행 성향 분석 알고리즘 (AI 프로젝트 이식)
   ══════════════════════════════════════════════ */

import type {
  QuizQuestion,
  TravelType,
  TravelTypeKey,
  UserAnswers,
  AnalysisScores,
  AnalysisResult,
} from '../types/personalityTypes';

import questionsData from '../data/questions.json';
import travelTypesData from '../data/travelTypes.json';

const questions: QuizQuestion[] = questionsData as QuizQuestion[];
const travelTypes: Record<TravelTypeKey, TravelType> = travelTypesData as Record<TravelTypeKey, TravelType>;

/** 사용자 답변을 기반으로 여행 성향 분석 */
export function analyzePersonality(answers: UserAnswers): AnalysisResult {
  const scores = calculateScores(answers);
  const travelType = determineTravelType(scores);
  const axisScores = calculateAxisScores(scores);

  return {
    type: travelType,
    typeData: travelTypes[travelType],
    scores,
    axisScores,
  };
}

function calculateScores(answers: UserAnswers): AnalysisScores {
  const scores: AnalysisScores = {
    plan: 0, spontaneous: 0, adventure: 0, safe: 0,
    active: 0, rest: 0, social: 0, solo: 0,
    healing: 0, aesthetic: 0, food: 0, nature: 0, easygoing: 0,
  };

  questions.forEach((question) => {
    const answer = answers[question.id];
    if (!answer) return;
    const selectedOption = question.options.find((opt) => opt.value === answer);
    if (!selectedOption) return;
    Object.entries(selectedOption.scores).forEach(([key, value]) => {
      if (key in scores) {
        scores[key as keyof AnalysisScores] += value as number;
      }
    });
  });

  return scores;
}

function determineTravelType(scores: AnalysisScores): TravelTypeKey {
  const planScore = scores.plan - scores.spontaneous;
  const adventureScore = scores.adventure - scores.safe;
  const activeScore = scores.active - scores.rest;
  const socialScore = scores.social - scores.solo;

  if (scores.easygoing >= 2 && socialScore >= 1) return 'easy_going';
  if (scores.solo >= 3 && adventureScore >= 1) return 'lone_wanderer';
  if (scores.food >= 3 && adventureScore >= 1) return 'local_gourmet';
  if (activeScore >= 3 && adventureScore >= 2) return 'action_seeker';
  if (scores.aesthetic >= 3) return 'trend_setter';
  if (scores.healing >= 3 && planScore >= 0) return 'cozy_healer';
  if (adventureScore >= 3 && planScore < 0) return 'free_spirit';
  if (planScore >= 3) return 'master_planner';

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

  return (Object.entries(typeScores).reduce((max, [key, value]) =>
    value > typeScores[max] ? (key as TravelTypeKey) : max,
    'master_planner' as TravelTypeKey
  ));
}

function calculateAxisScores(scores: AnalysisScores) {
  return {
    plan: scores.plan - scores.spontaneous,
    adventure: scores.adventure - scores.safe,
    active: scores.active - scores.rest,
    social: scores.social - scores.solo,
  };
}

export function getQuestions(): QuizQuestion[] {
  return questions;
}

export function getTravelTypes(): Record<TravelTypeKey, TravelType> {
  return travelTypes;
}

export function getTravelType(key: TravelTypeKey): TravelType {
  return travelTypes[key];
}
