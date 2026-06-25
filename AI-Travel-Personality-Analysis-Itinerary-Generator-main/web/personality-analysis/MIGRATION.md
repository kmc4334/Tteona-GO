# 🔄 React + TypeScript 마이그레이션 가이드

## 📌 변경 사항

### 기술 스택 업그레이드

**이전**: Vanilla JavaScript
**현재**: React 18 + TypeScript + Vite

### 주요 개선사항

1. **타입 안정성**: TypeScript로 전체 코드베이스 타입 정의
2. **컴포넌트 기반**: React 컴포넌트로 UI 모듈화
3. **빌드 최적화**: Vite를 통한 빠른 개발 및 빌드
4. **유지보수성**: 명확한 파일 구조와 타입 정의

## 📁 파일 매핑

### 이전 구조 → 새 구조

```
personality-data.js
  → src/data/questions.json
  → src/data/travelTypes.json
  → src/types/index.ts

personality-analyzer.js (예정)
  → src/utils/analyzer.ts

personality-ui.js (예정)
  → src/components/Quiz.tsx
  → src/components/Result.tsx

personality-styles.css (예정)
  → src/components/Quiz.css
  → src/components/Result.css
  → src/App.css
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
cd personality-analysis
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 브라우저 접속

```
http://localhost:3001
```

## 🔧 API 변경사항

### 이전 (JavaScript)

```javascript
// 데이터 임포트
const { QUIZ_QUESTIONS, TRAVEL_TYPES } = require('./personality-data.js');

// 분석 실행
const analyzer = new PersonalityAnalyzer();
const result = analyzer.analyze(answers);
```

### 현재 (TypeScript)

```typescript
// 데이터 임포트
import { getQuestions, getTravelTypes } from './utils/analyzer';
import type { UserAnswers } from './types';

// 분석 실행
import { analyzePersonality } from './utils/analyzer';
const result = analyzePersonality(answers);
```

## 📦 빌드 및 배포

### 개발 빌드

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

### 빌드 미리보기

```bash
npm run preview
```

## 🔗 통합 가이드

### 메인 웹 앱에서 사용하기

#### 옵션 1: iframe 임베딩

```html
<iframe 
  src="/personality-analysis/index.html" 
  width="100%" 
  height="800px"
  frameborder="0"
></iframe>
```

#### 옵션 2: 빌드 파일 통합

1. `npm run build` 실행
2. `dist/` 폴더의 파일을 메인 앱에 복사
3. 메인 앱에서 라우팅 설정

```javascript
// Express.js 예시
app.use('/personality', express.static('personality-analysis/dist'));
```

#### 옵션 3: 모듈로 임포트 (React 앱인 경우)

```typescript
import PersonalityAnalysis from './personality-analysis/src/App';

function MainApp() {
  return (
    <div>
      <PersonalityAnalysis />
    </div>
  );
}
```

## 🐛 문제 해결

### 포트 충돌

기본 포트(3001)가 사용 중인 경우:

```bash
# vite.config.ts에서 포트 변경
server: {
  port: 3002,
}
```

### 타입 에러

```bash
# TypeScript 컴파일 확인
npm run build
```

### 의존성 문제

```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

## 📚 추가 리소스

- [React 공식 문서](https://react.dev/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)
- [Vite 공식 문서](https://vitejs.dev/)

## 🤝 기여

버그 리포트나 기능 제안은 메인 프로젝트 저장소에 이슈로 등록해주세요.

---

**Version**: 2.0.0  
**Migration Date**: 2026-05-20  
**Author**: 떠나GO Team
