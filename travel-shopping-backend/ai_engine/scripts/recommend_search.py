import sys
import json
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from internal.models import TravelItem, Location, Review
from internal.recommendation import QueryParser, Filter, FilterOptions, Ranker

# 샘플 여행지 데이터베이스
TRAVEL_DB = [
    {"id":"item_001","name":"해운대 해변","description":"부산 대표 해수욕장","tags":["해변","자연","감성"],"category":"attraction","city":"부산","lat":35.16,"lng":129.16,"rating":4.8,"popularity":0.92,"price_range":"free","duration":120},
    {"id":"item_002","name":"감천문화마을","description":"알록달록 벽화마을","tags":["감성","문화","야외"],"category":"attraction","city":"부산","lat":35.10,"lng":129.01,"rating":4.7,"popularity":0.88,"price_range":"free","duration":90},
    {"id":"item_003","name":"광안리 해변","description":"광안대교 야경 명소","tags":["야경","해변","감성"],"category":"attraction","city":"부산","lat":35.15,"lng":129.12,"rating":4.6,"popularity":0.85,"price_range":"free","duration":100},
    {"id":"item_004","name":"국제시장","description":"부산 전통 시장","tags":["맛집","쇼핑","문화"],"category":"restaurant","city":"부산","lat":35.10,"lng":129.03,"rating":4.4,"popularity":0.78,"price_range":"cheap","duration":120},
    {"id":"item_005","name":"부산 박물관","description":"부산 역사 문화 박물관","tags":["문화","박물관"],"category":"attraction","city":"부산","lat":35.15,"lng":129.09,"rating":4.3,"popularity":0.65,"price_range":"moderate","duration":150},
    {"id":"item_006","name":"경복궁","description":"조선 왕조 정궁","tags":["문화","역사","야외"],"category":"attraction","city":"서울","lat":37.58,"lng":126.98,"rating":4.7,"popularity":0.95,"price_range":"cheap","duration":180},
    {"id":"item_007","name":"북촌한옥마을","description":"전통 한옥 거리","tags":["감성","문화","조용"],"category":"attraction","city":"서울","lat":37.58,"lng":126.98,"rating":4.5,"popularity":0.82,"price_range":"free","duration":90},
    {"id":"item_008","name":"남산타워","description":"서울 야경 명소","tags":["야경","감성","자연"],"category":"attraction","city":"서울","lat":37.55,"lng":126.99,"rating":4.6,"popularity":0.90,"price_range":"moderate","duration":120},
    {"id":"item_009","name":"성산일출봉","description":"제주 유네스코 세계유산","tags":["자연","야외","힐링"],"category":"attraction","city":"제주","lat":33.46,"lng":126.94,"rating":4.9,"popularity":0.96,"price_range":"cheap","duration":150},
    {"id":"item_010","name":"한라산","description":"제주 최고봉 등반","tags":["액티비티","자연","야외"],"category":"attraction","city":"제주","lat":33.36,"lng":126.53,"rating":4.8,"popularity":0.88,"price_range":"free","duration":360},
    {"id":"item_011","name":"협재해수욕장","description":"에메랄드빛 제주 해변","tags":["해변","힐링","자연"],"category":"attraction","city":"제주","lat":33.39,"lng":126.24,"rating":4.7,"popularity":0.85,"price_range":"free","duration":120},
    {"id":"item_012","name":"동문시장","description":"제주 전통 야시장","tags":["맛집","쇼핑","문화"],"category":"restaurant","city":"제주","lat":33.51,"lng":126.53,"rating":4.5,"popularity":0.80,"price_range":"cheap","duration":90},
]

data = json.loads(sys.stdin.read())
query = data.get('query', '')
preferences = data.get('preferences', {})
filter_opts_data = data.get('filters', {})

# 쿼리 파싱
parser = QueryParser()
parsed = parser.parse(query)

# TravelItem 객체 생성
items = []
for d in TRAVEL_DB:
    items.append(TravelItem(
        id=d['id'], name=d['name'], description=d['description'],
        tags=d['tags'], category=d['category'],
        location=Location(latitude=d['lat'], longitude=d['lng'], city=d['city'], address='', country=''),
        rating=d['rating'], popularity=d['popularity'],
        price_range=d['price_range'], duration=d['duration'],
        reviews=[], image='', url=''
    ))

# 필터링
filter_obj = Filter()
opts = FilterOptions(
    min_rating=filter_opts_data.get('min_rating', 0.0),
    price_range=filter_opts_data.get('price_range', ''),
    region=parsed.region or filter_opts_data.get('region', ''),
    tags=parsed.tags,
)
filtered = filter_obj.apply(items, opts)

# 랭킹 (유사도는 임시로 균등 배분)
ranker = Ranker()
similarities = [0.8] * len(filtered)
ranked = ranker.rank(filtered, similarities, preferences)

result_items = []
for r in ranked[:8]:
    result_items.append({
        'id': r.item.id,
        'name': r.item.name,
        'description': r.item.description,
        'tags': r.item.tags,
        'category': r.item.category,
        'city': r.item.location.city,
        'rating': r.item.rating,
        'popularity': r.item.popularity,
        'price_range': r.item.price_range,
        'duration': r.item.duration,
        'score': round(r.score, 3),
        'lat': r.item.location.latitude,
        'lng': r.item.location.longitude,
    })

print(json.dumps({
    'query': query,
    'parsed': {
        'region': parsed.region,
        'tags': parsed.tags,
        'budget': parsed.budget,
        'activity_level': parsed.activity_level,
    },
    'items': result_items,
    'total': len(result_items),
}, ensure_ascii=False))
