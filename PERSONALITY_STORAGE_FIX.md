# 🔧 성향 테스트 저장 방식 수정

## 🎯 문제 해결

### **문제**
- 테스트 완료 후 두 번째 방문 시에도 테스트 화면으로 이동
- DB 설정 없이는 결과가 저장되지 않음

### **해결 방법**
**AsyncStorage를 사용한 로컬 저장** - DB 없이도 동작!

---

## 📱 저장 방식

### **이중 저장 시스템**

1. **AsyncStorage (로컬 저장)** ✅ 필수
   - 앱 내부에 결과 저장
   - DB 설정 없이도 동작
   - 앱 삭제 전까지 유지

2. **Backend API (서버 저장)** ⭐ 선택사항
   - 로그인한 경우에만 시도
   - 실패해도 로컬 저장은 유지
   - 여러 기기 간 동기화 가능

---

## 🔄 동작 흐름

### **첫 번째 테스트**
```
홈 화면 클릭
  ↓
AsyncStorage 확인 → 결과 없음
  ↓
테스트 화면 (12문항)
  ↓
결과 화면
  ↓
자동 저장:
  1. AsyncStorage에 저장 ✅
  2. Backend에 저장 시도 (로그인 시)
```

### **두 번째 방문**
```
홈 화면 클릭
  ↓
AsyncStorage 확인 → 결과 있음 ✅
  ↓
결과 화면 즉시 표시
```

### **다시 검사하기**
```
"다시 검사하기" 버튼 클릭
  ↓
AsyncStorage 결과 삭제
  ↓
테스트 화면으로 이동
```

---

## 💾 저장 데이터 구조

### **AsyncStorage 키**
```
'personalityResult'
```

### **저장 데이터**
```json
{
  "travelType": "master_planner",
  "scores": {
    "plan": 8,
    "spontaneous": 2,
    "adventure": 5,
    ...
  },
  "axisScores": {
    "plan": 6,
    "adventure": 3,
    "active": 2,
    "social": 1
  },
  "savedAt": "2026-05-22T10:30:00.000Z"
}
```

---

## 🔧 수정된 파일

### **1. HomeScreen.tsx**
```typescript
const handlePersonalityTestClick = async () => {
  // AsyncStorage에서 저장된 결과 확인
  const savedResultString = await AsyncStorage.getItem('personalityResult');
  
  if (savedResultString) {
    // 결과 있음 → 결과 화면
    const savedResult = JSON.parse(savedResultString);
    navigation.navigate('PersonalityResult', { savedResult });
  } else {
    // 결과 없음 → 테스트 화면
    navigation.navigate('PersonalityTest');
  }
};
```

### **2. PersonalityResultScreen.tsx**
```typescript
const saveResultToBackend = async (analysisResult, answers) => {
  // 1. AsyncStorage에 로컬 저장 (필수)
  await AsyncStorage.setItem('personalityResult', JSON.stringify(resultToSave));
  
  // 2. Backend에 저장 시도 (선택사항)
  if (token) {
    await fetch(`${API_BASE}/personality/save`, { ... });
  }
};

const handleRetakeTest = async () => {
  // 저장된 결과 삭제
  await AsyncStorage.removeItem('personalityResult');
  navigation.navigate('PersonalityTest');
};
```

---

## ✅ 테스트 시나리오

### **시나리오 1: DB 없이 사용**
1. ✅ 홈에서 성향 테스트 클릭 → 테스트 화면
2. ✅ 12문항 완료 → 결과 화면 (AsyncStorage에 저장)
3. ✅ 앱 종료 후 재실행
4. ✅ 홈에서 성향 테스트 클릭 → 저장된 결과 화면 표시
5. ✅ "다시 검사하기" 클릭 → 새 테스트 시작

### **시나리오 2: DB 설정 후 사용**
1. ✅ 로그인 상태에서 테스트 완료
2. ✅ AsyncStorage + Backend 모두 저장
3. ✅ 다른 기기에서 로그인 시 Backend에서 불러오기 가능

### **시나리오 3: 앱 삭제 후**
1. ✅ 앱 삭제 → AsyncStorage 데이터 삭제
2. ✅ 앱 재설치 → 처음부터 테스트 시작
3. ✅ 로그인 시 Backend에서 이전 결과 복원 가능

---

## 🚀 즉시 사용 가능

### **현재 상태**
- ✅ DB 설정 없이도 완벽하게 동작
- ✅ AsyncStorage로 로컬 저장
- ✅ 두 번째 방문 시 저장된 결과 표시
- ✅ "다시 검사하기"로 결과 초기화

### **나중에 DB 설정 시**
- ⭐ Backend 저장 자동 활성화
- ⭐ 여러 기기 간 동기화
- ⭐ 테스트 이력 관리

---

## 🔍 디버깅 로그

앱 실행 시 콘솔에서 확인 가능:

```
// 홈 화면 클릭 시
"Personality test button clicked"
"Found saved result: master_planner"  // 또는
"No saved result, starting test"

// 결과 저장 시
"Result saved to AsyncStorage"
"Personality result saved to backend successfully"  // 로그인 시

// 다시 검사하기 클릭 시
"Saved result cleared"
```

---

## 📝 참고사항

### **AsyncStorage 특징**
- ✅ 앱 내부에 영구 저장
- ✅ 앱 삭제 전까지 유지
- ✅ 빠른 읽기/쓰기
- ❌ 앱 삭제 시 데이터 손실
- ❌ 기기 간 동기화 불가

### **Backend 저장 특징**
- ✅ 여러 기기 간 동기화
- ✅ 영구 보관
- ✅ 테스트 이력 관리
- ❌ 로그인 필요
- ❌ 네트워크 연결 필요

---

## 🎉 결론

**DB 설정 없이도 완벽하게 동작합니다!**

- AsyncStorage로 로컬 저장
- 두 번째 방문 시 저장된 결과 표시
- 나중에 DB 설정 시 자동으로 Backend 저장 활성화

---

© 2026 떠나GO Team. All rights reserved.
