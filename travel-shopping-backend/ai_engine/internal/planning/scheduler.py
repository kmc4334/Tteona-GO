from typing import List, Dict, Tuple
from ..models import TimeSlot, TravelItem

class Scheduler:
    def __init__(self):
        self.morning_start = 9
        self.afternoon_start = 12
        self.evening_start = 18
        self.day_end = 21

    def schedule_items(self, items: List[TravelItem], preferences: Dict[str, float]) -> Tuple[List[TimeSlot], float, float]:
        time_slots = []
        total_distance = 0.0
        total_duration = 0.0

        if not items:
            return time_slots, total_distance, total_duration

        # Determine schedule density based on preferences
        density = self._calculate_density(preferences)
        items_per_day = int(len(items) * density)
        if items_per_day < 1:
            items_per_day = 1
        if items_per_day > len(items):
            items_per_day = len(items)

        current_hour = self.morning_start
        previous_loc = items[0].location  # Track for distance calculation

        for i in range(items_per_day):
            item = items[i]
            duration = item.duration / 60  # Convert minutes to hours
            if duration == 0:
                duration = 1

            # Calculate distance from previous item
            distance = 0.0
            if i > 0:
                from .optimizer import Optimizer
                optimizer = Optimizer()
                distance = optimizer._calculate_distance(previous_loc, item.location)
                total_distance += distance

            # Create time slot
            start_time = f"{current_hour:02d}:00"
            end_hour = current_hour + int(duration)
            if end_hour > self.day_end:
                end_hour = self.day_end
            end_time = f"{end_hour:02d}:00"

            time_slot = TimeSlot(
                id=f"slot_{i}",
                start_time=start_time,
                end_time=end_time,
                duration=item.duration,
                item=item,
                notes="",
                distance=distance,
            )

            time_slots.append(time_slot)

            current_hour = end_hour
            total_duration += duration
            previous_loc = item.location

            # If reached end of day, stop
            if current_hour >= self.day_end:
                break

            # Add break between items
            current_hour += 1

        return time_slots, total_distance, total_duration

    def _calculate_density(self, preferences: Dict[str, float]) -> float:
        healing_score = preferences.get("힐링", 0.0)
        activity_score = preferences.get("액티비티", 0.0)

        if healing_score > activity_score:
            # Prefer relaxed schedule (fewer activities)
            return 0.5 + (0.3 * (1 - healing_score))
        else:
            # Prefer packed schedule (more activities)
            return 0.7 + (0.2 * activity_score)

    def adjust_for_weather(self, slots: List[TimeSlot], weather: str) -> List[TimeSlot]:
        adjusted = slots.copy()

        for i, slot in enumerate(adjusted):
            if weather == "rainy":
                # Prioritize indoor activities
                if slot.item.category == "attraction":
                    slot.notes = "실내 활동 추천 (비)"
            elif weather == "hot":
                slot.notes = "음료/카페 추천 (더움)"
            elif weather == "cold":
                slot.notes = "따뜻한 실내 활동 추천 (추움)"
            adjusted[i] = slot

        return adjusted

    def distribute_time_slots(self, items: List[TravelItem]) -> Dict[str, List[TravelItem]]:
        distribution = {
            "morning": [],
            "afternoon": [],
            "evening": [],
        }

        items_per_slot = len(items) // 3
        if items_per_slot == 0:
            items_per_slot = 1

        for i, item in enumerate(items):
            slot = i // items_per_slot
            if slot == 0:
                distribution["morning"].append(item)
            elif slot == 1:
                distribution["afternoon"].append(item)
            else:
                distribution["evening"].append(item)

        return distribution