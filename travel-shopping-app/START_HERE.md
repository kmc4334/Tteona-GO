# 🚀 시작하기

## 흰 화면 문제가 해결되었습니다!

### ✅ 적용된 수정사항
1. NotificationContext logout 함수 누락 수정
2. Error Boundary 추가 (앱 크래시 방지)
3. 디버깅 로그 추가

---

## 🎯 지금 바로 실행하기

### 1단계: 백엔드 서버 실행

**새 터미널을 열고:**

```bash
cd c:\Ddeona-GO\travel-shopping-backend
npm start
```

> ⚠️ 백엔드가 실행되지 않으면 앱에서 데이터를 불러올 수 없습니다!

### 2단계: 프론트엔드 앱 실행

**원래 터미널 또는 새 터미널에서:**

```bash
cd c:\Ddeona-GO\travel-shopping-app
npx expo start --clear
```

### 3단계: 앱 열기

Metro Bundler가 실행되면:

- **웹 브라우저**: `w` 키 입력
- **Android**: `a` 키 입력
- **Expo Go 앱**: QR 코드 스캔

---

## ✅ 성공 확인

### 터미널에서 다음 로그를 확인하세요:

```
🚀 App component mounting...
🗺️ AppNavigator rendering...
📱 BottomTabNavigator rendering...
```

### 앱에서 다음을 확인하세요:

✓ 홈 화면이 정상적으로 표시됨  
✓ 하단 탭 바가 보임 (홈, AI 추천, 일정, 장바구니, 마이)  
✓ 날씨 카드가 표시됨  
✓ 배너가 슬라이딩됨

---

## ❌ 여전히 흰 화면이 나타나면?

### 빠른 해결 방법:

1. **Ctrl + C**로 Metro 종료
2. 다음 명령 실행:

```bash
npx expo start --clear
```

3. 웹 브라우저에서 **F12** 눌러서 콘솔 확인
4. 에러 메시지 확인

### 일반적인 문제:

#### 문제 1: "Network request failed"
**원인**: 백엔드 서버가 실행되지 않음  
**해결**: 1단계의 백엔드 서버 실행 확인

#### 문제 2: "Unable to resolve module"
**원인**: 패키지 설치 필요  
**해결**:
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

#### 문제 3: 로그가 아예 안 나타남
**원인**: JavaScript 번들링 오류  
**해결**:
```bash
# Windows
taskkill /F /IM node.exe
npx expo start --clear
```

---

## 📚 추가 문서

- **[run-app.md](./run-app.md)**: 상세한 실행 가이드
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**: 문제 해결 가이드
- **[QA_REPORT.md](./QA_REPORT.md)**: 전체 코드 QA 보고서
- **[../FIXES_APPLIED.md](../FIXES_APPLIED.md)**: 적용된 수정사항 요약

---

## 💡 개발 팁

### 코드 변경 시 자동 새로고침
파일을 저장하면 앱이 자동으로 새로고침됩니다.

### 빠른 새로고침
- **웹**: `Ctrl+R` 또는 브라우저 새로고침
- **앱**: `R` 키 입력

### 개발자 메뉴
- **웹**: F12 → Console
- **앱**: 디바이스 흔들기 또는 `Ctrl+M` (Android) / `Cmd+D` (iOS)

---

## 🎉 준비 완료!

이제 앱을 실행하고 개발을 시작할 수 있습니다!

문제가 발생하면 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)를 참고하세요.

---

**마지막 업데이트**: 2026-06-29  
**상태**: ✅ 실행 준비 완료
