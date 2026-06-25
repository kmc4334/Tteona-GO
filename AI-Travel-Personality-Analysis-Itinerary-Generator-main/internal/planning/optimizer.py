import math
from typing import List
from ..models import TravelItem, Location

class Optimizer:
    def __init__(self):
        pass

    def optimize_route(self, items: List[TravelItem]) -> List[TravelItem]:
        if len(items) <= 1:
            return items

        # Use greedy nearest neighbor algorithm for TSP approximation
        visited = set()
        result = []

        # Start with first item
        current = 0
        visited.add(current)
        result.append(items[current])

        # Greedily pick nearest unvisited item
        while len(result) < len(items):
            nearest = -1
            min_distance = float('inf')

            for i, item in enumerate(items):
                if i in visited:
                    continue

                distance = self._calculate_distance(items[current].location, item.location)
                if distance < min_distance:
                    min_distance = distance
                    nearest = i

            if nearest == -1:
                break

            visited.add(nearest)
            result.append(items[nearest])
            current = nearest

        return result

    def _calculate_distance(self, loc1: Location, loc2: Location) -> float:
        # Haversine formula
        R = 6371  # Earth radius in km

        lat1 = math.radians(loc1.latitude)
        lat2 = math.radians(loc2.latitude)
        delta_lat = math.radians(loc2.latitude - loc1.latitude)
        delta_lon = math.radians(loc2.longitude - loc1.longitude)

        a = (math.sin(delta_lat / 2) ** 2 +
             math.cos(lat1) * math.cos(lat2) *
             math.sin(delta_lon / 2) ** 2)

        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = R * c

        return distance

    def calculate_total_distance(self, items: List[TravelItem]) -> float:
        if len(items) < 2:
            return 0.0

        total_distance = 0.0
        for i in range(len(items) - 1):
            total_distance += self._calculate_distance(items[i].location, items[i + 1].location)

        return total_distance

    def sort_by_distance(self, items: List[TravelItem], reference: Location) -> List[TravelItem]:
        distances = []
        for item in items:
            dist = self._calculate_distance(reference, item.location)
            distances.append((item, dist))

        distances.sort(key=lambda x: x[1])

        result = [item for item, _ in distances]
        return result