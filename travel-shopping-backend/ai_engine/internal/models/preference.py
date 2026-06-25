from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List

@dataclass
class PreferenceProfile:
    user_id: str
    profile: Dict[str, float]  # e.g., {"힐링": 0.7, "액티비티": 0.2}
    vector: List[float]  # normalized vector
    weights: Dict[str, float]  # for recommendation weighting
    last_updated: datetime
    created_at: datetime

@dataclass
class OnboardingAnswers:
    travel_style: List[str]  # e.g., ["힐링", "자연"]
    budget: str  # "low", "medium", "high"
    activity_level: str  # "low", "medium", "high"
    food_interest: bool
    duration: int  # days

@dataclass
class PreferenceChange:
    changed: bool
    dominant_shift: str
    cosine_similarity: float

@dataclass
class SimilarUser:
    user_id: str
    similarity: float