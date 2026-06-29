# ✅ 날짜 직접 입력 기능 추가

## 🎯 기능

사용자가 출발일과 도착일을 **두 가지 방법**으로 설정할 수 있습니다:

### 1️⃣ 텍스트 직접 입력
- 입력 필드에 `YYYY-MM-DD` 형식으로 직접 타이핑
- 예: `2024-12-25`
- 10자 입력 완료 시 자동으로 날짜 인식 및 적용

### 2️⃣ 달력 선택
- 📅 버튼 클릭하여 DatePicker로 날짜 선택
- 플랫폼별 최적화된 UI (Android 다이얼로그, iOS Modal)

## 🔧 구현 내용

### 1. 상태 추가
```typescript
const [startDateText, setStartDateText] = useState('');
const [endDateText, setEndDateText] = useState('');
```

### 2. 날짜 파싱 함수
```typescript
const parseDate = (dateText: string): Date | null => {
  // YYYY-MM-DD 형식 확인
  const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = dateText.match(regex);
  
  if (!match) return null;
  
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // 0-based
  const day = parseInt(match[3], 10);
  
  const date = new Date(year, month, day);
  
  // 유효한 날짜인지 확인
  if (date.getFullYear() === year && 
      date.getMonth() === month && 
      date.getDate() === day) {
    return date;
  }
  
  return null;
};
```

### 3. 텍스트 입력 핸들러
```typescript
const handleStartDateTextChange = (text: string) => {
  setStartDateText(text);
  
  // YYYY-MM-DD 형식이 완성되면 자동으로 Date 객체 업데이트
  if (text.length === 10) {
    const parsed = parseDate(text);
    if (parsed) {
      setStartDate(parsed);
      if (parsed > endDate) {
        setEndDate(parsed);
        setEndDateText(formatDate(parsed));
      }
    }
  }
};
```

### 4. UI 구조
```typescript
<View style={styles.dateInputContainer}>
  {/* 텍스트 입력 필드 */}
  <TextInput 
    style={styles.dateInput} 
    value={startDateText || formatDate(startDate)} 
    onChangeText={handleStartDateTextChange}
    placeholder="YYYY-MM-DD" 
    placeholderTextColor="#999"
    maxLength={10}
  />
  
  {/* 달력 버튼 */}
  <TouchableOpacity 
    style={styles.calendarBtn} 
    onPress={() => setShowStartPicker(true)}
  >
    <CalendarIcon size={20} color={Colors.primary} />
  </TouchableOpacity>
</View>
```

### 5. 스타일
```typescript
dateInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1.5,
  borderColor: '#E0E0E0',
  borderRadius: 10,
  backgroundColor: '#fff',
  paddingLeft: 14,
},
dateInput: {
  flex: 1,
  padding: 14,
  paddingLeft: 0,
  fontSize: 15,
  color: '#1A1A1A',
},
calendarBtn: {
  padding: 12,
  paddingRight: 14,
},
```

## 📱 사용 방법

### 방법 1: 직접 입력
```
1. 출발일 입력 필드 클릭
2. 키보드로 "2024-12-25" 입력
3. 10자 입력 완료 시 자동으로 날짜 적용
4. ✅ 버튼에 날짜 표시
```

### 방법 2: 달력 선택
```
1. 📅 버튼 클릭
2. DatePicker에서 날짜 선택
3. 확인/완료 버튼 클릭
4. ✅ 입력 필드에 날짜 표시
```

## ✨ 자동 기능

### 1. 양방향 동기화
- **텍스트 입력** → Date 객체 업데이트 → DatePicker 반영
- **DatePicker 선택** → Date 객체 업데이트 → 텍스트 필드 반영

### 2. 자동 검증
```typescript
// 출발일 입력 시
if (parsed > endDate) {
  setEndDate(parsed);           // 도착일 자동 조정
  setEndDateText(formatDate(parsed));
}

// 도착일 입력 시
if (parsed < startDate) {
  Alert.alert('알림', '도착일은 출발일 이후여야 합니다.');
}
```

### 3. 실시간 포맷 표시
- 입력 중: 사용자가 입력한 텍스트 그대로 표시
- 10자 완성: 유효성 검증 후 Date 객체로 변환
- 달력 선택: `formatDate(date)` 형식으로 표시

## 🧪 테스트 시나리오

### 시나리오 1: 텍스트 직접 입력
```
✓ 출발일 필드 클릭
✓ "2024" 입력 → 표시: "2024"
✓ "-12" 입력 → 표시: "2024-12"
✓ "-25" 입력 → 표시: "2024-12-25"
✓ 자동으로 Date 객체 업데이트
✓ 도착일이 출발일보다 이전이면 자동 조정
```

### 시나리오 2: 달력으로 선택
```
✓ 📅 버튼 클릭
✓ DatePicker 표시
✓ 2024-12-25 선택
✓ 확인 버튼 클릭
✓ 텍스트 필드에 "2024-12-25" 표시
```

### 시나리오 3: 잘못된 날짜 입력
```
✓ "2024-13-45" 입력 (잘못된 날짜)
✓ parseDate() 함수가 null 반환
✓ Date 객체 업데이트 안 됨
✓ 이전 날짜 유지
```

### 시나리오 4: 날짜 수정
```
✓ 현재 출발일: 2024-12-25
✓ 텍스트 필드 클릭
✓ 모두 지우고 "2024-12-30" 입력
✓ 새 날짜로 업데이트
```

### 시나리오 5: 혼합 사용
```
✓ 텍스트로 "2024-12-25" 입력
✓ 📅 버튼 클릭
✓ DatePicker에 2024-12-25 표시됨
✓ 2024-12-30으로 변경
✓ 텍스트 필드에 "2024-12-30" 반영
```

## 🎨 UI 디자인

### Before (달력 버튼만)
```
┌─────────────────────────┐
│ 📅  2024-12-25          │  ← 버튼 (클릭만 가능)
└─────────────────────────┘
```

### After (텍스트 + 달력)
```
┌─────────────────────────┐
│ 2024-12-25          📅  │  ← 텍스트 입력 + 달력 버튼
│ ↑ 타이핑 가능       ↑   │
│                  클릭   │
└─────────────────────────┘
```

## 📋 입력 규칙

### ✅ 허용되는 형식
- `2024-12-25` (YYYY-MM-DD)
- `2024-01-01` (앞자리 0 포함)
- `2025-12-31` (미래 날짜)

### ❌ 허용되지 않는 형식
- `24-12-25` (2자리 연도)
- `2024/12/25` (슬래시 구분자)
- `2024.12.25` (점 구분자)
- `25-12-2024` (DD-MM-YYYY)
- `2024-13-01` (잘못된 월)
- `2024-02-30` (존재하지 않는 날짜)

## 🔍 날짜 유효성 검증

### 1. 형식 검증
```typescript
const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
```
- 정확히 YYYY-MM-DD 형식인지 확인
- 4자리 연도, 2자리 월, 2자리 일

### 2. 날짜 검증
```typescript
const date = new Date(year, month, day);

if (date.getFullYear() === year && 
    date.getMonth() === month && 
    date.getDate() === day) {
  return date;  // 유효한 날짜
}

return null;  // 잘못된 날짜
```

### 3. 날짜 관계 검증
- 도착일 >= 출발일
- 출발일 변경 시 도착일 자동 조정

## 💡 사용자 경험 개선

### 1. 즉각적인 피드백
- 10자 입력 완료 → 즉시 검증 및 적용
- 잘못된 날짜 → 조용히 무시 (이전 값 유지)

### 2. 자동 완성
- DatePicker로 선택한 날짜 자동 표시
- 텍스트 입력 시 Date 객체 자동 업데이트

### 3. 유연한 입력
- 키보드 입력 선호 → 직접 타이핑
- 터치 입력 선호 → 달력 선택
- 두 방법 혼합 사용 가능

### 4. 모바일 최적화
- `maxLength={10}` → 불필요한 입력 방지
- `placeholder="YYYY-MM-DD"` → 명확한 형식 안내
- 달력 버튼 크기 충분 → 터치하기 쉬움

## 🐛 엣지 케이스 처리

### 1. 빈 문자열
```typescript
value={startDateText || formatDate(startDate)}
```
- 텍스트가 없으면 현재 Date 객체 값 표시

### 2. 중간 입력
```typescript
if (text.length === 10) {
  // 10자일 때만 검증
}
```
- "2024" 입력 중에는 검증 안 함
- 완성된 후에만 처리

### 3. 복사-붙여넣기
- 클립보드에서 "2024-12-25" 붙여넣기 가능
- 10자 완성 즉시 검증 및 적용

### 4. 백스페이스로 삭제
- 날짜 지우고 다시 입력 가능
- 10자 미만일 때는 Date 객체 유지

## ✅ 완료!

이제 사용자가 원하는 방식으로 날짜를 입력할 수 있습니다:

- 🎯 **빠른 입력**: 키보드로 직접 타이핑
- 🎯 **정확한 선택**: 달력에서 날짜 선택
- 🎯 **자유로운 수정**: 언제든지 변경 가능
- 🎯 **자동 검증**: 잘못된 날짜 방지

## 🚀 다음 테스트

```bash
# 1. 앱 재시작
RESTART_APP_CLEAN.bat

# 2. 일정 페이지 이동

# 3. 테스트
- 출발일 필드에 "2024-12-25" 직접 입력
- 📅 버튼으로 도착일 선택
- 날짜 수정 가능 확인
- 잘못된 날짜 입력 시 동작 확인
```

🎉 날짜 직접 입력 및 달력 선택 기능 완성!
