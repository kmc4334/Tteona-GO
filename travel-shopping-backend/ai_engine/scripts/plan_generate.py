import sys
import json
import os
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from internal.models import TravelItem, Location, ItineraryRequest
from internal.planning import Generator

data = json.loads(sys.stdin.read())

items_data = data.get('items', [])
days = data.get('days', 3)
preferences = data.get('preferences', {})
user_id = data.get('user_id', 'user001')

# TravelItem 객체 생성
items = []
for d in items_data:
    items.append(TravelItem(
        id=d['id'], name=d['name'], description=d.get('description', ''),
        tags=d.get('tags', []), category=d.get('category', 'attraction'),
        location=Location(
            latitude=d.get('lat', 0.0), longitude=d.get('lng', 0.0),
            city=d.get('city', ''), address='', country=''
        ),
        rating=d.get('rating', 4.0), popularity=d.get('popularity', 0.5),
        price_range=d.get('price_range', 'moderate'),
        duration=d.get('duration', 120),
        reviews=[], image='', url=''
    ))

generator = Generator()
request = ItineraryRequest(
    items=items,
    days=days,
    preferences=preferences,
    start_date=datetime.now(),
)

itinerary = generator.generate(user_id, request)

# 직렬화
schedule_out = []
for day_sched in itinerary.schedule:
    slots_out = []
    for slot in day_sched.time_slots:
        slots_out.append({
            'id': slot.id,
            'start_time': slot.start_time,
            'end_time': slot.end_time,
            'duration': slot.duration,
            'distance': round(slot.distance, 2),
            'notes': slot.notes,
            'item': {
                'id': slot.item.id,
                'name': slot.item.name,
                'description': slot.item.description,
                'tags': slot.item.tags,
                'category': slot.item.category,
                'city': slot.item.location.city,
                'rating': slot.item.rating,
                'price_range': slot.item.price_range,
                'duration': slot.item.duration,
                'lat': slot.item.location.latitude,
                'lng': slot.item.location.longitude,
            }
        })
    schedule_out.append({
        'day': day_sched.day,
        'date': day_sched.date.strftime('%Y-%m-%d'),
        'time_slots': slots_out,
    })

print(json.dumps({
    'id': itinerary.id,
    'user_id': itinerary.user_id,
    'days': itinerary.days,
    'total_distance': round(itinerary.total_distance, 2),
    'total_duration': round(itinerary.total_duration, 1),
    'schedule': schedule_out,
}, ensure_ascii=False))
