import uuid
from datetime import datetime, timedelta
from typing import List
from ..models import Itinerary, DaySchedule, ItineraryRequest, TravelItem
from .optimizer import Optimizer
from .scheduler import Scheduler

class Generator:
    def __init__(self):
        self.optimizer = Optimizer()
        self.scheduler = Scheduler()

    def generate(self, user_id: str, request: ItineraryRequest) -> Itinerary:
        # Cluster items by location
        clusters = self._cluster_items(request.items)

        # Distribute items across days
        day_assignments = self._distribute_across_days(clusters, request.days)

        # Create schedule
        itinerary = Itinerary(
            id=self._generate_id(),
            user_id=user_id,
            title="여행 일정",
            description="AI가 생성한 최적화 여행 일정",
            days=request.days,
            start_date=request.start_date,
            end_date=request.start_date + timedelta(days=request.days-1),
            schedule=[],
            total_distance=0.0,
            total_duration=0.0,
            estimated_cost=0.0,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        # Build day schedules
        total_distance = 0.0
        total_duration = 0.0

        for day in range(request.days):
            day_items = day_assignments[day]
            
            # Optimize route for this day
            optimized_items = self.optimizer.optimize_route(day_items)
            
            # Create time slots
            time_slots, day_distance, day_duration = self.scheduler.schedule_items(optimized_items, request.preferences)
            
            itinerary.schedule.append(DaySchedule(
                day=day + 1,
                date=request.start_date + timedelta(days=day),
                time_slots=time_slots,
                day_notes="",
            ))
            
            total_distance += day_distance
            total_duration += day_duration

        itinerary.total_distance = total_distance
        itinerary.total_duration = total_duration

        return itinerary

    def _cluster_items(self, items: List[TravelItem]) -> List[List[TravelItem]]:
        if not items:
            return []

        # Simple clustering: group by city
        clusters = {}

        for item in items:
            city = item.location.city
            if city not in clusters:
                clusters[city] = []
            clusters[city].append(item)

        # Convert map to list
        result = list(clusters.values())

        return result

    def _distribute_across_days(self, clusters: List[List[TravelItem]], days: int) -> List[List[TravelItem]]:
        day_assignments = [[] for _ in range(days)]

        # Distribute clusters round-robin
        day_idx = 0
        for cluster in clusters:
            for item in cluster:
                day_assignments[day_idx % days].append(item)
            day_idx += 1

        return day_assignments

    def _generate_id(self) -> str:
        return f"itin_{datetime.now().strftime('%Y%m%d%H%M%S')}"