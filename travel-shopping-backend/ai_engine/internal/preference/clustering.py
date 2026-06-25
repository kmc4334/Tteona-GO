import math
from typing import List, Dict
from ..models import PreferenceProfile, SimilarUser
from .analyzer import Analyzer

class Clustering:
    def __init__(self, analyzer: Analyzer):
        self.analyzer = analyzer

    def find_similar_users(self, current_user: PreferenceProfile, k: int, users: List[PreferenceProfile]) -> List[SimilarUser]:
        similarities = []

        for user in users:
            if user.user_id == current_user.user_id:
                continue  # Skip self

            sim = self.analyzer._cosine_similarity(current_user.vector, user.vector)
            similarities.append({
                'user_id': user.user_id,
                'similarity': sim,
            })

        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x['similarity'], reverse=True)

        # Return top k
        result = []
        for i in range(min(len(similarities), k)):
            result.append(SimilarUser(
                user_id=similarities[i]['user_id'],
                similarity=similarities[i]['similarity'],
            ))

        return result

    def euclidean_distance(self, vec1: List[float], vec2: List[float]) -> float:
        if len(vec1) != len(vec2):
            return 0

        sum_squares = sum((a - b) ** 2 for a, b in zip(vec1, vec2))
        return math.sqrt(sum_squares)

    def cluster_users(self, users: List[PreferenceProfile], k: int) -> Dict[str, List[SimilarUser]]:
        clusters = {}

        for user in users:
            similar = self.find_similar_users(user, k, users)
            clusters[user.user_id] = similar

        return clusters