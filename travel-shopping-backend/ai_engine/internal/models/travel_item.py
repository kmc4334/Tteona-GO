from dataclasses import dataclass
from typing import List

@dataclass
class Location:
    latitude: float
    longitude: float
    address: str
    city: str
    country: str

@dataclass
class Review:
    id: str
    rating: int  # 1 - 5
    text: str

@dataclass
class ReviewSummary:
    pros: List[str]
    cons: List[str]

@dataclass
class TravelItem:
    id: str
    name: str
    description: str
    tags: List[str]
    category: str  # "attraction", "restaurant", "hotel", etc.
    location: Location
    rating: float  # 0.0 - 5.0
    popularity: float  # 0.0 - 1.0
    price_range: str  # "free", "cheap", "moderate", "expensive"
    duration: int  # in minutes
    reviews: List[Review]
    image: str
    url: str