# ⚡ 앱 재시작 필요!

## 🔧 수정 사항
- CreatePackageScreen에 default export 추가

## 🚀 즉시 실행하세요

### 1. Metro 번들러 종료
현재 실행 중인 터미널에서 **Ctrl + C** 눌러서 종료

### 2. 캐시 정리 후 재시작

```bash
cd c:\Ddeona-GO\travel-shopping-app
npx expo start --clear
```

### 3. 웹에서 테스트

Metro가 시작되면 `w` 키를 눌러서 웹 브라우저에서 열기

---

## ✅ 해결된 문제

**에러 메시지**:
```
Couldn't find a 'component', 'getComponent' or 'children' prop for the screen 'CreatePackage'
```

**원인**:
- CreatePackageScreen의 export가 Metro 번들러 캐시에 제대로 인식되지 않음

**해결**:
1. default export 추가
2. Metro 캐시 정리

---

## 🔍 여전히 오류가 발생하면?

### 옵션 1: 완전한 캐시 정리

```bash
# 터미널 1 - 백엔드
cd c:\Ddeona-GO\travel-shopping-backend
npm start

# 터미널 2 - 프론트엔드
cd c:\Ddeona-GO\travel-shopping-app

# Windows에서 모든 node 프로세스 종료
taskkill /F /IM node.exe

# 재시작
npx expo start --clear
```

### 옵션 2: Watchman 캐시 정리 (Mac/Linux만)

```bash
watchman watch-del-all
```

### 옵션 3: node_modules 재설치

```bash
cd c:\Ddeona-GO\travel-shopping-app
rm -rf node_modules
npm install
npx expo start --clear
```

---

## 📱 성공 확인

앱이 정상적으로 실행되면:

1. ✅ 홈 화면 로드
2. ✅ 하단 탭 5개 표시 (홈, AI 추천, **일정**, 장바구니, 마이)
3. ✅ "일정" 탭 클릭 시 CreatePackageScreen 또는 ScheduleScreen 표시
4. ✅ 에러 메시지 없음

---

**지금 바로 실행하세요!** 

Ctrl + C → `npx expo start --clear` → `w` 키
