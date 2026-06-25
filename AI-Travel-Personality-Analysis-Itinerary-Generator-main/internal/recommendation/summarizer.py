import os
from typing import List
from ..models import Review, ReviewSummary

class Summarizer:
    def __init__(self):
        self.use_openai = False  # Simplified, no OpenAI for now
        self.positive_sentiments = {
            "좋음", "훌륭", "최고", "추천", "멋짐",
            "만족", "깨끗", "넓음", "쾌적", "친절",
            "위치", "가치", "편함", "환상", "완벽",
        }
        self.negative_sentiments = {
            "나쁨", "최악", "실망", "불만", "더러움",
            "비쌈", "소음", "불친절", "불편", "복잡",
            "겹침", "혼잡", "시끄러움", "지저분", "비효율",
        }

    def summarize(self, reviews: List[Review]) -> ReviewSummary:
        if not reviews:
            return ReviewSummary(pros=[], cons=[])

        if self.use_openai:
            return self._summarize_with_openai(reviews)

        # Fallback to keyword-based summarization
        return self._fallback_summarize(reviews)

    def _summarize_with_openai(self, reviews: List[Review]) -> ReviewSummary:
        # Mock implementation
        return self._fallback_summarize(reviews)

    def _fallback_summarize(self, reviews: List[Review]) -> ReviewSummary:
        sentiment_map = {}

        for review in reviews:
            lowered = review.text.lower()
            words = lowered.split()

            for word in words:
                word = word.strip(".,!?;:")
                if word in self.positive_sentiments:
                    sentiment_map[word] = sentiment_map.get(word, 0) + 1
                elif word in self.negative_sentiments:
                    sentiment_map[word] = sentiment_map.get(word, 0) + 1

        pros = []
        cons = []
        for keyword, count in sentiment_map.items():
            if count > 0:
                if keyword in self.positive_sentiments and keyword not in pros:
                    pros.append(keyword)
                elif keyword in self.negative_sentiments and keyword not in cons:
                    cons.append(keyword)

        # Limit to 5 each
        pros = pros[:5]
        cons = cons[:5]

        return ReviewSummary(pros=pros, cons=cons)