from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict

@dataclass
class TimeSlot:
    id: str
    start_time: str  # "09:00"
    end_time: str  # "11:00"
    duration: int  # in minutes
    item: 'TravelItem'  # Forward reference
    notes: str
    distance: float  # from previous item in km

@dataclass
class DaySchedule:
    day: int
    date: datetime
    time_slots: List[TimeSlot]
    day_notes: str

@dataclass
class Itinerary:
    id: str
    user_id: str
    title: str
    description: str
    days: int
    start_date: datetime
    end_date: datetime
    schedule: List[DaySchedule]
    total_distance: float  # in km
    total_duration: float  # in hours
    estimated_cost: float
    created_at: datetime
    updated_at: datetime

@dataclass
class ItineraryRequest:
    items: List['TravelItem']
    days: int
    preferences: Dict[str, float]
    start_date: datetime