from typing import List
from ..models import TravelItem

class FilterOptions:
    def __init__(self, min_rating: float = 0.0, max_distance: float = 0.0, price_range: str = "", tags: List[str] = None, region: str = ""):
        self.min_rating = min_rating
        self.max_distance = max_distance
        self.price_range = price_range
        self.tags = tags or []
        self.region = region

class Filter:
    def __init__(self):
        pass

    def apply(self, items: List[TravelItem], options: FilterOptions) -> List[TravelItem]:
        filtered = []

        for item in items:
            if self._matches_filter(item, options):
                filtered.append(item)

        return filtered

    def _matches_filter(self, item: TravelItem, options: FilterOptions) -> bool:
        # Check rating
        if item.rating < options.min_rating:
            return False

        # Check price range
        if options.price_range and item.price_range and item.price_range != options.price_range:
            return False

        # Check tags (if specified)
        if options.tags and not self._has_any_tag(item.tags, options.tags):
            return False

        # Check region
        if options.region and item.location.city != options.region:
            return False

        return True

    def _has_any_tag(self, item_tags: List[str], filter_tags: List[str]) -> bool:
        tag_set = set(item_tags)
        for tag in filter_tags:
            if tag in tag_set:
                return True
        return False

    def budget_filter(self, items: List[TravelItem], budget: str) -> List[TravelItem]:
        filtered = []

        for item in items:
            if self._matches_budget(item.price_range, budget):
                filtered.append(item)

        return filtered

    def _matches_budget(self, item_price: str, budget: str) -> bool:
        if budget == "low":
            return item_price in ["free", "cheap"]
        elif budget == "medium":
            return item_price in ["free", "cheap", "moderate"]
        elif budget == "high":
            return True  # No restriction for high budget
        else:
            return True