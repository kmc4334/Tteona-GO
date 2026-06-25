import sys
import json
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from internal.models import OnboardingAnswers
from internal.preference import Analyzer

data = json.loads(sys.stdin.read())

analyzer = Analyzer()
answers = OnboardingAnswers(
    travel_style=data.get('travel_style', []),
    budget=data.get('budget', 'medium'),
    activity_level=data.get('activity_level', 'medium'),
    food_interest=data.get('food_interest', False),
    duration=data.get('duration', 3),
)

pref = analyzer.initialize_preference(data.get('user_id', 'user001'), answers)

result = {
    'user_id': pref.user_id,
    'profile': pref.profile,
    'vector': pref.vector,
    'weights': pref.weights,
}

print(json.dumps(result, ensure_ascii=False))
