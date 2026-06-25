import math
from datetime import datetime
from typing import Dict, List
from ..models import PreferenceProfile, OnboardingAnswers, PreferenceChange

class Analyzer:
    def __init__(self):
        self.tag_weights = {
            "힐링": 0.5,
            "자연": 0.3,
            "액티비티": 0.4,
            "야외": 0.35,
            "맛집": 0.3,
            "문화": 0.25,
            "야경": 0.2,
            "박물관": 0.25,
            "쇼핑": 0.2,
            "나이트라이프": 0.15,
        }

    def initialize_preference(self, user_id: str, answers: OnboardingAnswers) -> PreferenceProfile:
        profile = {}
        
        # Initialize profile with onboarding answers
        for style in answers.travel_style:
            if style in self.tag_weights:
                profile[style] = self.tag_weights[style]

        # Adjust based on activity level
        if answers.activity_level == "high":
            profile["액티비티"] = 0.5
            profile["야외"] = 0.4
        elif answers.activity_level == "low":
            profile["힐링"] = 0.6

        # Adjust based on food interest
        if answers.food_interest:
            profile["맛집"] = 0.4

        # Normalize the profile to create vector
        vector = self._normalize_profile(profile)

        pref = PreferenceProfile(
            user_id=user_id,
            profile=profile,
            vector=vector,
            weights=self._generate_weights(vector),
            last_updated=datetime.now(),
            created_at=datetime.now(),
        )

        return pref

    def update_preference_from_event(self, current: PreferenceProfile, event) -> PreferenceProfile:
        profile = current.profile.copy()

        # Update weights based on event tags
        alpha = 0.1  # Learning rate
        weight = 1.0

        # Apply decay based on event type
        if event.event_type == "click":
            weight = 0.5
        elif event.event_type == "purchase":
            weight = 1.0
        elif event.event_type == "view":
            weight = 0.3

        # Update each tag in the event
        for tag in event.tags:
            if tag in self.tag_weights:
                current_value = profile.get(tag, 0)
                profile[tag] = current_value + alpha * weight * self.tag_weights[tag]
            else:
                # Add new tag if not exists
                profile[tag] = alpha * weight

        # Normalize
        vector = self._normalize_profile(profile)

        return PreferenceProfile(
            user_id=current.user_id,
            profile=profile,
            vector=vector,
            weights=self._generate_weights(vector),
            last_updated=datetime.now(),
            created_at=current.created_at,
        )

    def _normalize_profile(self, profile: Dict[str, float]) -> List[float]:
        values = list(profile.values())
        total = sum(values)
        if total == 0:
            total = 1
        return [v / total for v in values]

    def _generate_weights(self, vector: List[float]) -> Dict[str, float]:
        weights = {}
        tag_names = ["힐링", "액티비티", "맛집", "자연", "문화"]
        
        for i, tag in enumerate(tag_names):
            if i < len(vector):
                weights[tag] = vector[i] * 2.0  # Scale for better discrimination
        
        return weights

    def detect_preference_change(self, previous: PreferenceProfile, current: PreferenceProfile) -> PreferenceChange:
        similarity = self._cosine_similarity(previous.vector, current.vector)
        
        # Threshold for change detection
        change_threshold = 0.1
        changed = (1.0 - similarity) > change_threshold

        return PreferenceChange(
            changed=changed,
            cosine_similarity=similarity,
            dominant_shift=self._find_dominant_shift(previous.profile, current.profile),
        )

    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        if len(vec1) != len(vec2):
            return 0

        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a * a for a in vec1))
        norm2 = math.sqrt(sum(b * b for b in vec2))

        if norm1 == 0 or norm2 == 0:
            return 1.0

        return dot_product / (norm1 * norm2)

    def _find_dominant_shift(self, prev: Dict[str, float], current: Dict[str, float]) -> str:
        max_diff = 0
        shift_tag = ""
        
        for tag, current_val in current.items():
            prev_val = prev.get(tag, 0)
            diff = current_val - prev_val
            if diff > max_diff:
                max_diff = diff
                shift_tag = tag

        return shift_tag