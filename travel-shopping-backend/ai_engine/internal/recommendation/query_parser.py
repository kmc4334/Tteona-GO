from typing import List, Dict, Any

class ParsedQuery:
    def __init__(self, original_query: str = "", region: str = "", tags: List[str] = None, budget: str = "", activity_level: str = "", keywords: List[str] = None):
        self.original_query = original_query
        self.region = region
        self.tags = tags or []
        self.budget = budget
        self.activity_level = activity_level
        self.keywords = keywords or []

class QueryParser:
    def __init__(self):
        self.region_keywords = {
            "부산": "부산",
            "서울": "서울",
            "제주": "제주",
            "인천": "인천",
            "대구": "대구",
            "대전": "대전",
            "광주": "광주",
            "울산": "울산",
            "경주": "경주",
            "전주": "전주",
        }
        self.tag_keywords = {
            "조용": "조용",
            "감성": "감성",
            "자연": "자연",
            "힐링": "힐링",
            "액티비티": "액티비티",
            "야외": "야외",
            "맛집": "맛집",
            "문화": "문화",
            "야경": "야경",
            "박물관": "박물관",
            "쇼핑": "쇼핑",
            "밤": "야경",
            "음식": "맛집",
        }

    def parse(self, query: str) -> ParsedQuery:
        parsed = ParsedQuery(
            original_query=query,
            tags=[],
            keywords=[],
        )

        # Lowercase for comparison
        lowered_query = query.lower()

        # Extract region
        for region in self.region_keywords:
            if region in lowered_query:
                parsed.region = self.region_keywords[region]
                break

        # Extract tags
        for keyword, tag in self.tag_keywords.items():
            if keyword in lowered_query:
                parsed.tags.append(tag)

        # Simple budget detection
        if "저렴" in lowered_query or "싼" in lowered_query:
            parsed.budget = "low"
        elif "비싼" in lowered_query or "럭셔리" in lowered_query:
            parsed.budget = "high"
        else:
            parsed.budget = "medium"

        # Activity level detection
        if "조용" in lowered_query or "휴식" in lowered_query:
            parsed.activity_level = "low"
        elif "액티비티" in lowered_query or "모험" in lowered_query:
            parsed.activity_level = "high"
        else:
            parsed.activity_level = "medium"

        # Extract raw keywords
        words = query.split()
        for word in words:
            if len(word) > 2:  # Skip very short words
                parsed.keywords.append(word)

        return parsed

    def ner(self, query: str) -> Dict[str, Any]:
        entities = {}
        
        parsed = self.parse(query)
        
        if parsed.region:
            entities["LOCATION"] = parsed.region
        
        if parsed.tags:
            entities["ATTRIBUTES"] = parsed.tags
        
        entities["BUDGET"] = parsed.budget
        entities["ACTIVITY"] = parsed.activity_level
        
        return entities