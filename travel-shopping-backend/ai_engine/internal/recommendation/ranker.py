import math
from typing import List, Dict
from ..models import TravelItem

class RankedItem:
    def __init__(self, item: TravelItem, score: float, similarity_score: float = 0.0, rating_score: float = 0.0, preference_score: float = 0.0, popularity_score: float = 0.0):
        self.item = item
        self.score = score
        self.similarity_score = similarity_score
        self.rating_score = rating_score
        self.preference_score = preference_score
        self.popularity_score = popularity_score

class Ranker:
    def __init__(self):
        self.similarity_weight = 0.4
        self.rating_weight = 0.2
        self.preference_weight = 0.2
        self.popularity_weight = 0.2

    def calculate_score(self, item: TravelItem, similarity: float, preferences: Dict[str, float]) -> RankedItem:
        # Normalize rating (0-5) to 0-1 scale
        rating_score = item.rating / 5.0
        
        # Popularity is already 0-1
        popularity_score = item.popularity

        # Calculate preference score based on tags
        preference_score = self._calculate_preference_score(item.tags, preferences)

        # Combined score
        total_score = (self.similarity_weight * similarity +
                      self.rating_weight * rating_score +
                      self.preference_weight * preference_score +
                      self.popularity_weight * popularity_score)

        return RankedItem(
            item=item,
            score=total_score,
            similarity_score=similarity,
            rating_score=rating_score,
            preference_score=preference_score,
            popularity_score=popularity_score,
        )

    def _calculate_preference_score(self, tags: List[str], preferences: Dict[str, float]) -> float:
        if not tags or not preferences:
            return 0.5  # Default neutral score

        match_score = 0.0
        matched = 0

        for tag in tags:
            if tag in preferences:
                match_score += preferences[tag]
                matched += 1

        if matched == 0:
            return 0.3  # Low score if no matching tags

        return match_score / matched

    def rank(self, items: List[TravelItem], similarities: List[float], preferences: Dict[str, float]) -> List[RankedItem]:
        ranked = []

        for i, item in enumerate(items):
            similarity = similarities[i] if i < len(similarities) else 0.0
            
            ranked_item = self.calculate_score(item, similarity, preferences)
            ranked.append(ranked_item)

        # Sort by score (descending)
        ranked.sort(key=lambda x: x.score, reverse=True)

        return ranked

    def vector_similarity(self, query_vec: List[float], item_vec: List[float]) -> float:
        if not query_vec or not item_vec:
            return 0.0

        # Pad to same length
        max_len = max(len(query_vec), len(item_vec))

        query_pad = query_vec + [0.0] * (max_len - len(query_vec))
        item_pad = item_vec + [0.0] * (max_len - len(item_vec))

        dot_product = sum(a * b for a, b in zip(query_pad, item_pad))
        norm1 = math.sqrt(sum(a * a for a in query_pad))
        norm2 = math.sqrt(sum(b * b for b in item_pad))

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return dot_product / (norm1 * norm2)