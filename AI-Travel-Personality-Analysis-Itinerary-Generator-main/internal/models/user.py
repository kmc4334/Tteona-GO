from dataclasses import dataclass
from datetime import datetime
from typing import List

@dataclass
class User:
    id: str
    email: str
    created_at: datetime
    updated_at: datetime

@dataclass
class UserEvent:
    user_id: str
    event_type: str  # "click", "view", "purchase"
    item_id: str
    tags: List[str]
    timestamp: datetime