# 문제 해결 가이드

## 🔍 흰 화면 문제 해결

### 1. Metro Bundler 캐시 정리

```bash
# Expo 캐시 정리
npx expo start --clear

# 또는
npm start -- --clear
```

### 2. node_modules 재설치

```bash
# node_modules 삭제 및 재설치
rm -rf node_modules
rm package-lock.json
npm install

# Windows PowerShell에서
rmdir /s /q node_modules
del package-lock.json
npm install
```

### 3. Watchman 캐시 정리 (Mac/Linux)

```bash
watchman watch-del-all
```

### 4. 콘솔 로그 확인

앱 실행 시 다음 로그들이 나타나야 합니다:

```
🚀 App component mounting...
🗺️ AppNavigator rendering...
📱 BottomTabNavigator rendering...
```

로그가 나타나지 않으면 JavaScript 번들링 오류가 있을 수 있습니다.

### 5. 백엔드 서버 확인

API_BASE URL이 올바르게 설정되어 있는지 확인:

```typescript
// src/store/AuthContext.tsx
export const API_BASE = 'http://172.28.4.155:5000/api';
```

백엔드 서버가 실행 중인지 확인:

```bash
# 다른 터미널에서
cd c:\Ddeona-GO\travel-shopping-backend
npm start
```

## 🐛 일반적인 오류 해결

### Error: Unable to resolve module

**원인**: 필요한 패키지가 설치되지 않음

**해결**:
```bash
npm install
```

### Error: Metro bundler not responding

**원인**: Metro 서버 충돌

**해결**:
```bash
# 프로세스 종료 후 재시작
# Windows
taskkill /F /IM node.exe
npm start

# Mac/Linux
killall node
npm start
```

### Error: Network request failed

**원인**: 백엔드 서버가 실행되지 않거나 URL이 잘못됨

**해결**:
1. 백엔드 서버 실행 확인
2. API_BASE URL 확인
3. 네트워크 연결 확인

### Error: Cannot read property 'navigate' of undefined

**원인**: Navigation context 외부에서 useNavigation 사용

**해결**: NavigationContainer 내부에서만 사용

## 📱 디바이스별 문제

### iOS Simulator

```bash
npm run ios
```

문제 발생 시:
```bash
cd ios
pod install
cd ..
npm run ios
```

### Android Emulator

```bash
npm run android
```

문제 발생 시:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Expo Go 앱

1. Expo Go 앱 최신 버전 확인
2. 같은 네트워크에 연결되어 있는지 확인
3. 방화벽 설정 확인

## 🔧 개발 도구

### React Native Debugger 사용

```bash
# Chrome DevTools 열기
Ctrl+D (Android) 또는 Cmd+D (iOS)
→ Debug 선택
```

### 콘솔 로그 보기

```bash
# React Native 로그
npx react-native log-android  # Android
npx react-native log-ios       # iOS

# Expo 로그
npm start
# 터미널에서 로그 확인
```

## 📊 성능 문제

### 앱이 느린 경우

1. **이미지 최적화**: 이미지 크기 줄이기
2. **불필요한 리렌더링**: useMemo, useCallback 사용
3. **네트워크 요청**: 캐싱 전략 적용

### 메모리 누수

1. useEffect cleanup 함수 확인
2. 이벤트 리스너 정리
3. 타이머 정리 (setTimeout, setInterval)

## 🆘 추가 도움말

### 로그 활성화

디버깅을 위해 더 많은 로그 보기:

```typescript
// App.tsx에 추가
console.log('🚀 App component mounting...');
```

### Error Boundary 테스트

의도적으로 에러 발생시켜 Error Boundary 작동 확인:

```typescript
// 임시로 추가
throw new Error('Test error');
```

### AsyncStorage 초기화

모든 로컬 데이터 삭제:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// 개발자 도구에서 실행
AsyncStorage.clear();
```

## 📞 지원

문제가 계속되면:

1. GitHub Issue 생성
2. 에러 로그 전체 포함
3. 재현 단계 설명
4. 환경 정보 (OS, Node 버전, Expo 버전)

---

**마지막 업데이트**: 2026-06-29
