# 🚀 떠나GO 여행 성향 분석 - 설치 가이드

## 📋 시스템 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 9.0.0 이상
- **운영체제**: Windows, macOS, Linux

## 🔧 설치 단계

### 1. 프로젝트 디렉토리로 이동

```bash
cd C:\GoProject\web\personality-analysis
```

### 2. 의존성 설치

```bash
npm install
```

설치되는 주요 패키지:
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `typescript`: ^5.2.2
- `vite`: ^5.2.0
- `@vitejs/plugin-react`: ^4.2.1

### 3. 개발 서버 실행

```bash
npm run dev
```

출력 예시:
```
  VITE v5.2.0  ready in 500 ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 4. 브라우저에서 확인

브라우저를 열고 다음 주소로 접속:
```
http://localhost:3001
```

## 🎯 사용 가능한 명령어

### 개발 모드

```bash
npm run dev
```
- 개발 서버 시작
- 핫 리로드 활성화
- 포트: 3001

### 프로덕션 빌드

```bash
npm run build
```
- TypeScript 컴파일
- 프로덕션 최적화
- 출력 디렉토리: `dist/`

### 빌드 미리보기

```bash
npm run preview
```
- 빌드된 파일을 로컬 서버로 실행
- 프로덕션 환경 테스트

### 린트 검사

```bash
npm run lint
```
- ESLint로 코드 품질 검사
- TypeScript 타입 검사

## 📁 프로젝트 구조

```
personality-analysis/
├── src/                      # 소스 코드
│   ├── components/           # React 컴포넌트
│   │   ├── Quiz.tsx
│   │   ├── Quiz.css
│   │   ├── Result.tsx
│   │   └── Result.css
│   ├── data/                 # 데이터 파일
│   │   ├── questions.json
│   │   └── travelTypes.json
│   ├── types/                # TypeScript 타입
│   │   └── index.ts
│   ├── utils/                # 유틸리티 함수
│   │   └── analyzer.ts
│   ├── App.tsx               # 메인 앱
│   ├── App.css
│   ├── main.tsx              # 진입점
│   └── index.css
├── legacy/                   # 이전 JavaScript 파일
│   └── personality-data.js
├── index.html                # HTML 템플릿
├── package.json              # 의존성 정의
├── tsconfig.json             # TypeScript 설정
├── vite.config.ts            # Vite 설정
├── .eslintrc.cjs             # ESLint 설정
├── README.md                 # 프로젝트 문서
├── RESEARCH.md               # 심리학 이론 배경
├── MIGRATION.md              # 마이그레이션 가이드
└── SETUP.md                  # 이 문서
```

## 🔍 문제 해결

### 문제: `npm install` 실패

**해결책**:
```bash
# npm 캐시 정리
npm cache clean --force

# 재설치
npm install
```

### 문제: 포트 3001이 이미 사용 중

**해결책 1**: 다른 포트 사용
```bash
# vite.config.ts 수정
server: {
  port: 3002,
}
```

**해결책 2**: 기존 프로세스 종료 (Windows)
```bash
# 포트 사용 프로세스 확인
netstat -ano | findstr :3001

# 프로세스 종료 (PID 확인 후)
taskkill /PID <PID> /F
```

### 문제: TypeScript 에러

**해결책**:
```bash
# TypeScript 컴파일 확인
npx tsc --noEmit

# 타입 정의 재설치
npm install --save-dev @types/react @types/react-dom
```

### 문제: 빌드 실패

**해결책**:
```bash
# node_modules 삭제 후 재설치
rmdir /s /q node_modules
del package-lock.json
npm install

# 빌드 재시도
npm run build
```

## 🌐 배포

### 정적 호스팅 (Netlify, Vercel)

1. 프로젝트를 Git 저장소에 푸시
2. 호스팅 서비스에 연결
3. 빌드 명령어: `npm run build`
4. 출력 디렉토리: `dist`

### Express.js 서버에 통합

```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

// 정적 파일 제공
app.use('/personality', express.static(path.join(__dirname, 'personality-analysis/dist')));

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Docker 배포

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "preview"]
```

## 📊 성능 최적화

### 프로덕션 빌드 최적화

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

## 🔐 환경 변수

필요한 경우 `.env` 파일 생성:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_TITLE=떠나GO 여행 성향 분석
```

사용 방법:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📞 지원

문제가 지속되면:
1. GitHub Issues에 문제 등록
2. 프로젝트 팀에 문의
3. README.md의 문서 참조

## ✅ 설치 확인 체크리스트

- [ ] Node.js 18+ 설치 확인
- [ ] `npm install` 성공
- [ ] `npm run dev` 실행 성공
- [ ] 브라우저에서 http://localhost:3001 접속 가능
- [ ] 퀴즈 시작 버튼 클릭 가능
- [ ] 질문 답변 및 결과 확인 가능

---

**Version**: 2.0.0  
**Last Updated**: 2026-05-20  
**Author**: 떠나GO Team
