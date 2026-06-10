const fetch = require('node-fetch');

const data = [
  {
    "category": "체험",
    "title": "제주도 해녀 체험",
    "location": "제주 서귀포시",
    "rating": 4.7,
    "price": 55800,
    "image": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=800",
    "latitude": 33.3039,
    "longitude": 126.9194,
    "description": "유네스코 인류무형문화유산인 제주 해녀와 함께 직접 바다에 들어가 해산물을 채취해보는 특별한 경험입니다."
  },
  {
    "category": "교통수단",
    "title": "제주 렌터카 48시간 이용권",
    "location": "제주 전역",
    "rating": 4.5,
    "price": 89000,
    "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
    "latitude": 33.5113,
    "longitude": 126.4930,
    "description": "제주 여행의 필수품! 공항 픽업부터 반납까지 편리한 최신형 차량 렌트 서비스입니다."
  },
  {
    "category": "숙소",
    "title": "그랜드 하얏트 제주",
    "location": "제주 제주시",
    "rating": 4.8,
    "price": 350000,
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    "latitude": 33.4849,
    "longitude": 126.4818,
    "description": "제주 도심의 랜드마크에서 즐기는 럭셔리한 휴식. 최고의 전망과 서비스를 경험하세요."
  },
  {
    "category": "체험",
    "title": "한라산 영실코스 가이드 투어",
    "location": "제주 서귀포시",
    "rating": 4.6,
    "price": 45000,
    "image": "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=800",
    "latitude": 33.3617,
    "longitude": 126.5292,
    "description": "전문 가이드와 함께 안전하고 즐겁게 한라산의 비경을 감상하는 트레킹 코스입니다."
  },
  {
    "category": "관광지",
    "title": "부산 해운대 블루라인파크",
    "location": "부산 해운대구",
    "rating": 4.8,
    "price": 15000,
    "image": "https://images.unsplash.com/photo-1620336655055-088d06e36bf0?auto=format&fit=crop&q=80&w=800",
    "latitude": 35.1587,
    "longitude": 129.1604,
    "description": "해운대 해변 열차를 타고 즐기는 환상적인 바다 뷰."
  },
  {
    "category": "숙소",
    "title": "서울 시그니엘 호텔",
    "location": "서울 송파구",
    "rating": 4.9,
    "price": 650000,
    "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800",
    "latitude": 37.5126,
    "longitude": 127.1025,
    "description": "대한민국 최고의 높이에서 즐기는 프리미엄 호캉스."
  },
  {
    "category": "교통수단",
    "title": "KTX 서울-부산 왕복권",
    "location": "전국",
    "rating": 4.5,
    "price": 99800,
    "image": "https://images.unsplash.com/photo-1474487056217-76fe0300bc80?auto=format&fit=crop&q=80&w=800",
    "latitude": 37.5546,
    "longitude": 126.9706,
    "description": "빠르고 편안한 기차 여행의 시작."
  },
  {
    "category": "체험",
    "title": "경복궁 한복 대여 촬영권",
    "location": "서울 종로구",
    "rating": 4.7,
    "price": 25000,
    "image": "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&q=80&w=800",
    "latitude": 37.5796,
    "longitude": 126.9770,
    "description": "아름다운 한복을 입고 고궁에서 잊지 못할 추억을 만드세요."
  }
];

async function seed() {
  try {
    console.log('Sending seed data to LOCAL server...');
    const response = await fetch('http://localhost:5000/api/products/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log('Seed result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
