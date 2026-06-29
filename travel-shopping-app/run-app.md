# 앱 실행 가이드

## 🚀 빠른 시작

### 1. 의존성 설치 (최초 1회)

```bash
cd c:\Ddeona-GO\travel-shopping-app
npm install
```

### 2. 백엔드 서버 실행

**새 터미널을 열고:**

```bash
cd c:\Ddeona-GO\travel-shopping-backend
npm install  # 최초 1회만
npm start
```

서버가 `http://localhost:5000` 또는 `http://172.28.4.155:5000`에서 실행됩니다.

### 3. 프론트엔드 앱 실행

**원래 터미널에서:**

```bash
cd c:\Ddeona-GO\travel-shopping-app
npm start
```

또는 캐시 정리하고 실행:

```bash
npx expo start --clear
```

### 4. 앱 열기

Metro Bundler가 실행되면:

- **웹**: `w` 키 입력
- **Android**: `a` 키 입력 (에뮬레이터 실행 중이어야 함)
- **iOS**: `i` 키 입력 (Mac에서만, 시뮬레이터 필요)
- **Expo Go**: QR 코드 스캔

## 📱 플랫폼별 실행

### Windows에서 실행

#### Web 버전 (가장 쉬움)
```bash
npm start
# 그 다음 'w' 입력
```

#### Android 에뮬레이터
1. Android Studio 설치
2. AVD (Android Virtual Device) 생성
3. 에뮬레이터 시작
4. `npm run android`

### Mac에서 실행

#### iOS 시뮬레이터
```bash
npm run ios
```

#### Android 에뮬레이터
```bash
npm run android
```

### 실제 디바이스 (Expo Go)

1. 앱스토어/플레이스토어에서 "Expo Go" 설치
2. 컴퓨터와 같은 Wi-Fi 연결
3. `npm start` 실행
4. Expo Go 앱에서 QR 코드 스캔

## 🔍 실행 확인

### 성공적인 실행

터미널에서 다음과 같은 메시지를 확인:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
```

앱에서 다음 로그 확인:
```
🚀 App component mounting...
🗺️ AppNavigator rendering...
📱 BottomTabNavigator rendering...
```

### 문제 발생 시

[TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 참고

## 🛠️ 개발 모드 명령어

### 앱 실행
```bash
npm start          # 기본 실행
npm start -- --clear  # 캐시 정리 후 실행
npm run web        # 웹만
npm run android    # Android만
npm run ios        # iOS만 (Mac)
```

### 디버깅
```bash
# React Native Debugger 열기
# 앱에서 Ctrl+D (Android) 또는 Cmd+D (iOS)
```

### 코드 검증
```bash
node startup-check.js  # 파일 구조 검증
```

## 📝 환경 설정

### 백엔드 API URL 변경

`src/store/AuthContext.tsx` 파일에서:

```typescript
// 로컬 개발
export const API_BASE = 'http://localhost:5000/api';

// 실제 디바이스 (Expo Go)
export const API_BASE = 'http://YOUR_COMPUTER_IP:5000/api';

// 프로덕션
export const API_BASE = 'https://your-api.com/api';
```

### IP 주소 찾기

**Windows:**
```bash
ipconfig
# "IPv4 주소" 확인
```

**Mac/Linux:**
```bash
ifconfig
# "inet" 확인
```

## 🎯 첫 실행 체크리스트

- [ ] Node.js 설치 확인 (`node --version`)
- [ ] npm 설치 확인 (`npm --version`)
- [ ] 의존성 설치 완료 (`npm install`)
- [ ] 백엔드 서버 실행 중
- [ ] 같은 네트워크에 연결 (실제 디바이스 사용 시)
- [ ] API_BASE URL 올바르게 설정
- [ ] Metro Bundler 실행 (`npm start`)
- [ ] 앱이 열림 (웹/에뮬레이터/디바이스)

## 🔄 일반적인 워크플로우

1. **백엔드 시작**: `cd travel-shopping-backend && npm start`
2. **프론트엔드 시작**: `cd travel-shopping-app && npm start`
3. **코드 수정**: 파일 저장 시 자동 새로고침
4. **테스트**: 앱에서 기능 확인
5. **디버깅**: 콘솔 로그 및 개발자 도구 사용

## 💡 팁

### Hot Reload
코드 변경 시 자동으로 앱이 새로고침됩니다.

### 빠른 새로고침
- **Android/웹**: `Ctrl+R` 또는 `R`
- **iOS**: `Cmd+R` 또는 `R`

### 개발자 메뉴
- **Android**: 디바이스 흔들기 또는 `Ctrl+M`
- **iOS**: 디바이스 흔들기 또는 `Cmd+D`
- **Expo Go**: 3손가락으로 탭

### 성능 모니터링
개발자 메뉴 → "Show Perf Monitor"

## 📚 추가 리소스

- [Expo 문서](https://docs.expo.dev/)
- [React Native 문서](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript](https://www.typescriptlang.org/)

---

**준비 완료!** 즐거운 개발 되세요! 🎉
