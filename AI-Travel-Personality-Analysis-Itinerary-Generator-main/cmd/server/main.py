import os
import sys

# 프로젝트 루트를 sys.path에 추가 (어느 위치에서 실행해도 internal 패키지를 찾을 수 있도록)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from dotenv import load_dotenv
from datetime import datetime

# Import Python modules
from internal.models import (
    User, UserEvent, PreferenceProfile, OnboardingAnswers, 
    PreferenceChange, SimilarUser, TravelItem, Location, 
    Review, ReviewSummary, Itinerary, DaySchedule, TimeSlot, ItineraryRequest
)
from internal.preference import Analyzer, Clustering
from internal.recommendation import Filter, FilterOptions, QueryParser, Ranker, Summarizer
from internal.planning import Generator

# Load environment variables
load_dotenv()

print("=== 떠나GO AI System Prototype ===\n")

# ========================================
# 1. Preference AI Demo
# ========================================
print("1️⃣ Preference AI (성향 분석)")
print("----------------------------------------")

preference_analyzer = Analyzer()

# Onboarding
answers = OnboardingAnswers(
    travel_style=["힐링", "자연"],
    budget="medium",
    activity_level="low",
    food_interest=True,
    duration=3,
)

user_preference = preference_analyzer.initialize_preference("user123", answers)
print("초기 성향 프로필:")
print(f"  힐링: {user_preference.profile.get('힐링', 0.0):.2f}")
print(f"  액티비티: {user_preference.profile.get('액티비티', 0.0):.2f}")
print(f"  맛집: {user_preference.profile.get('맛집', 0.0):.2f}")
print(f"  정규화 벡터: {user_preference.vector[0]:.3f}\n")

# User behavior event
event = UserEvent(
    user_id="user123",
    event_type="click",
    item_id="item_001",
    tags=["액티비티", "야외"],
    timestamp=datetime.now(),
)

updated_preference = preference_analyzer.update_preference_from_event(user_preference, event)
change_detection = preference_analyzer.detect_preference_change(user_preference, updated_preference)

print("행동 기반 업데이트 후:")
print(f"  액티비티: {updated_preference.profile['액티비티']:.2f} (증가)")
print(f"  성향 변화 감지: {change_detection.changed}")
print(f"  코사인 유사도: {change_detection.cosine_similarity:.3f}\n")

# ========================================
# 2. Recommendation AI Demo
# ========================================
print("2️⃣ Recommendation AI (추천)")
print("----------------------------------------")

# Query parsing
query_parser = QueryParser()
query = "부산 조용한 감성 여행"
parsed = query_parser.parse(query)

print(f"쿼리 파싱: \"{query}\"")
print(f"  지역: {parsed.region}")
print(f"  태그: {parsed.tags}")
print(f"  예산: {parsed.budget}")
print(f"  활동 수준: {parsed.activity_level}\n")

# Sample travel items
items = [
    TravelItem(
        id="item_001",
        name="해운대 해변",
        description="부산의 대표 해수욕장으로 아름다운 해변과 감성적인 분위기를 자랑합니다.",
        tags=["해변", "자연", "감성"],
        category="attraction",
        location=Location(latitude=35.16, longitude=129.16, city="부산", address="", country=""),
        rating=4.8,
        popularity=0.92,
        price_range="free",
        duration=120,
        reviews=[],
        image="",
        url="",
    ),
    TravelItem(
        id="item_002",
        name="감성 카페",
        description="조용하고 아늑한 분위기의 감성 카페입니다.",
        tags=["카페", "조용", "감성"],
        category="restaurant",
        location=Location(latitude=35.17, longitude=129.15, city="부산", address="", country=""),
        rating=4.6,
        popularity=0.75,
        price_range="cheap",
        duration=90,
        reviews=[],
        image="",
        url="",
    ),
    TravelItem(
        id="item_003",
        name="부산 박물관",
        description="부산의 역사와 문화를 한눈에 볼 수 있는 박물관입니다.",
        tags=["문화", "박물관"],
        category="attraction",
        location=Location(latitude=35.15, longitude=129.14, city="부산", address="", country=""),
        rating=4.4,
        popularity=0.65,
        price_range="moderate",
        duration=150,
        reviews=[],
        image="",
        url="",
    ),
]

# Filtering
filter_obj = Filter()
filter_opts = FilterOptions(
    min_rating=4.0,
    price_range="free",
    region="부산",
)
filtered = filter_obj.apply(items, filter_opts)
print(f"필터링된 상품 수: {len(filtered)}/{len(items)}")

# Ranking
ranker = Ranker()
similarities = [0.95, 0.88, 0.75]
ranked = ranker.rank(filtered, similarities, updated_preference.weights)

print("상위 추천:")
for i, item in enumerate(ranked[:2]):
    print(f"  {i+1}. {item.item.name} (점수: {item.score:.3f})")
print()

# Review Summarization Demo
print("리뷰 요약 데모:")
summarizer = Summarizer()

# Sample reviews for 해운대 해변
sample_reviews = [
    Review(id="r1", rating=5, text="위치도 좋고 분위기도 최고예요! 해수욕하기 딱 좋아요"),
    Review(id="r2", rating=4, text="깨끗하고 넓어서 산책하기 좋아요. 다만 주말엔 사람이 많아요"),
    Review(id="r3", rating=3, text="괜찮은 곳이지만 물가가 좀 비싸요. 음식점 가격이 부담돼요"),
]

summary = summarizer.summarize(sample_reviews)
print("해운대 해변 리뷰 요약:")
print(f"  장점: {summary.pros}")
print(f"  단점: {summary.cons}\n")

# ========================================
# 3. Planning AI Demo
# ========================================
print("3️⃣ Planning AI (계획)")
print("----------------------------------------")

plan_generator = Generator()
request = ItineraryRequest(
    items=items,
    days=3,
    preferences=updated_preference.weights,
    start_date=datetime.now(),
)

itinerary = plan_generator.generate("user123", request)

print("생성된 여행 일정:")
print(f"  기간: {itinerary.days}일")
print(f"  총 거리: {itinerary.total_distance:.2f} km")
print(f"  총 시간: {itinerary.total_duration:.1f} 시간")
print("  Day 1 일정:")

if itinerary.schedule:
    for slot in itinerary.schedule[0].time_slots:
        print(f"    {slot.start_time} - {slot.end_time}: {slot.item.name} ({slot.distance:.1f} km)")
print()

# ========================================
# 4. Clustering Demo
# ========================================
print("4️⃣ User Clustering (유사 사용자 찾기)")
print("----------------------------------------")

# Create additional users
user2 = preference_analyzer.initialize_preference("user456", OnboardingAnswers(
    travel_style=["힐링", "자연"],
    budget="medium",
    activity_level="low",
    food_interest=True,
    duration=3,
))

user3 = preference_analyzer.initialize_preference("user789", OnboardingAnswers(
    travel_style=["액티비티", "야외"],
    budget="high",
    activity_level="high",
    food_interest=False,
    duration=5,
))

clustering = Clustering(preference_analyzer)
all_users = [updated_preference, user2, user3]
similar_users = clustering.find_similar_users(updated_preference, 2, all_users)

print(f"사용자 {updated_preference.user_id}과 유사한 사용자:")
for i, similar in enumerate(similar_users):
    print(f"  {i+1}. {similar.user_id} (유사도: {similar.similarity:.3f})")
print()

print("=== 프로토타입 시연 완료 ===")