# 성능 측정 가이드

이 문서는 GitHub Issue Viewer 프로젝트의 성능 측정 방법과 결과를 기록합니다.

## 목차

- [측정 방법](#측정-방법)
- [측정 도구 가이드](#측정-도구-가이드)
- [설정](#설정)
- [측정 시나리오](#측정-시나리오)
- [성능 측정 결과](#성능-측정-결과)
- [Chrome DevTools Performance 사용법](#chrome-devtools-performance-사용법)

---

## 측정 도구 가이드

프로젝트에서 사용하는 성능 측정 도구에 대한 상세한 설명은 [measurement-tools.md](./measurement-tools.md)를 참고하세요.

**간단 요약:**
- **Lighthouse CLI**: 초기 페이지 로드 성능 측정 (Core Web Vitals)
- **Chrome DevTools Performance (수동)**: 상세한 렌더링 성능 분석
- **Lighthouse 자동화**: 초기 로드 성능의 자동화된 측정
- **Chrome DevTools Performance 자동화** ⭐: 대량 데이터 로드 후 성능 차이의 자동화된 측정

---

## 측정 방법

### 1. Lighthouse CLI 사용 (초기 로드만 측정)

가장 간단하고 빠르게 초기 페이지 로드 성능을 측정할 수 있는 방법입니다.

#### 설치

```bash
npm install -D lighthouse
```

#### 측정 실행

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 성능 측정:
   ```bash
   npm run perf:measure
   ```

3. 결과 확인:
   - HTML 리포트: `docs/performance/report.html`
   - 브라우저에서 자동으로 열림

#### JSON 형식으로 저장 (비교용)

```bash
npm run perf:json
```

결과가 `docs/performance/report.json`에 저장됩니다.

**⚠️ 주의**: Lighthouse CLI는 초기 페이지 로드만 측정합니다. 사용자 상호작용("더 보기" 버튼 클릭 등)은 자동화 스크립트를 사용하세요.

### 1-1. 자동화 스크립트 사용 (추천) ⭐

Puppeteer를 사용하여 사용자 상호작용을 자동으로 시뮬레이션하고 Lighthouse로 측정합니다.

#### 설치

```bash
npm install -D puppeteer tsx
```

#### 사용 가능한 시나리오

1. **초기 로드 (100개 이슈)**
   ```bash
   npm run perf:auto:initial
   ```

2. **500개 이슈 로드 후 측정**
   ```bash
   npm run perf:auto:500
   ```

3. **1000개 이슈 로드 후 측정**
   ```bash
   npm run perf:auto:1000
   ```

4. **스크롤 성능 테스트 (500개 이슈 로드 후 스크롤)**
   ```bash
   npm run perf:auto:scroll
   ```

5. **모든 시나리오 실행**
   ```bash
   npm run perf:auto
   ```

#### 측정 실행

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 자동화 스크립트 실행:
   ```bash
   npm run perf:auto:500
   ```

3. 결과 확인:
   - JSON 리포트가 `docs/performance/` 폴더에 저장됩니다
   - 파일명 형식: `{시나리오명}-{날짜}.json`
   - 예: `load-500-issues-2025-11-12.json`

#### 자동화 스크립트의 장점

- ✅ "더 보기" 버튼 클릭 자동화
- ✅ 스크롤 동작 자동화
- ✅ 대량 데이터 로드 후 측정 가능
- ✅ 반복 측정 시 일관된 결과
- ✅ 수동 작업 불필요

**⚠️ 주의**: Lighthouse는 초기 페이지 로드만 측정하므로, "더 보기" 버튼 클릭 후 추가된 이슈는 측정에 포함되지 않습니다.

### 1-2. Chrome DevTools Performance 자동화 스크립트 (추천) ⭐⭐

Puppeteer의 Performance API를 사용하여 이미 로드된 페이지의 현재 상태를 측정합니다. Lighthouse와 달리 "더 보기" 버튼 클릭 후 추가된 이슈도 포함하여 측정할 수 있습니다.

#### 설치

```bash
npm install -D puppeteer tsx
```

#### 사용 가능한 시나리오

1. **초기 로드 (100개 이슈)**
   ```bash
   npm run perf:devtools:initial
   ```

2. **500개 이슈 로드 후 측정**
   ```bash
   npm run perf:devtools:500
   ```

3. **1000개 이슈 로드 후 측정**
   ```bash
   npm run perf:devtools:1000
   ```

4. **스크롤 성능 테스트 (500개 이슈 로드 후 스크롤)**
   ```bash
   npm run perf:devtools:scroll
   ```

5. **모든 시나리오 실행**
   ```bash
   npm run perf:devtools
   ```

#### 측정 실행

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 자동화 스크립트 실행:
   ```bash
   npm run perf:devtools:500
   ```

3. 결과 확인:
   - JSON 리포트가 `docs/performance/` 폴더에 저장됩니다
   - 파일명 형식: `devtools-{시나리오명}-{날짜}.json`
   - 예: `devtools-load-500-issues-2025-11-12.json`

#### 측정 항목

- **DOM 노드 수**: 현재 페이지의 총 DOM 노드 수
- **이슈 아이템 수**: 실제 렌더링된 이슈 아이템 수 (PR 필터링 후)
- **메모리 사용량**: JavaScript Heap 사용량
- **Performance API 메트릭**: FCP, DOM Content Loaded, Load Complete

#### Chrome DevTools Performance 자동화 스크립트의 장점

- ✅ "더 보기" 버튼 클릭 후 추가된 이슈도 측정 가능
- ✅ 현재 페이지 상태를 직접 측정 (Lighthouse와 달리)
- ✅ DOM 노드 수, 메모리 사용량 등 상세 메트릭 제공
- ✅ 대량 데이터 로드 전후 비교 가능
- ✅ 반복 측정 시 일관된 결과
- ✅ 수동 작업 불필요

### 2. Chrome DevTools Performance (수동 측정)

렌더링 성능을 상세하게 분석할 때 사용합니다.

#### 사용 방법

1. 개발 서버 실행: `npm run dev`
2. Chrome 브라우저에서 `http://localhost:3003` 접속
3. 개발자 도구 열기 (F12)
4. **Performance** 탭 선택
5. **Record** 버튼 클릭 (또는 Ctrl+E)
6. 페이지 로드 및 스크롤 동작 수행
7. **Stop** 버튼 클릭
8. 결과 분석

#### 측정 시나리오

- **초기 로드**: 페이지 첫 로드부터 이슈 목록 표시까지
- **스크롤**: 여러 페이지 스크롤 (100개, 500개, 1000개 이슈 로드)
- **"더 보기" 클릭**: 다음 페이지 로드 동작

---

## 설정

### package.json 스크립트

다음 스크립트가 `package.json`에 추가되어 있습니다:

```json
{
  "scripts": {
    "perf:measure": "lighthouse http://localhost:3003 --output html --output-path ./docs/performance/report.html --view",
    "perf:json": "lighthouse http://localhost:3003 --output json --output-path ./docs/performance/report.json",
    "perf:baseline": "lighthouse http://localhost:3003 --output html --output-path ./docs/performance/baseline-$(date +%Y-%m-%d).html",
    "perf:auto": "tsx scripts/performance-test.ts",
    "perf:auto:initial": "tsx scripts/performance-test.ts initial-load",
    "perf:auto:500": "tsx scripts/performance-test.ts load-500-issues",
    "perf:auto:1000": "tsx scripts/performance-test.ts load-1000-issues",
    "perf:auto:scroll": "tsx scripts/performance-test.ts scroll-performance",
    "perf:devtools": "tsx scripts/performance-devtools.ts",
    "perf:devtools:initial": "tsx scripts/performance-devtools.ts initial-load",
    "perf:devtools:500": "tsx scripts/performance-devtools.ts load-500-issues",
    "perf:devtools:1000": "tsx scripts/performance-devtools.ts load-1000-issues",
    "perf:devtools:scroll": "tsx scripts/performance-devtools.ts scroll-performance"
  }
}
```

### 측정 전 준비사항

1. **개발 서버 실행 확인**
   ```bash
   npm run dev
   ```

2. **브라우저 캐시 클리어** (선택사항)
   - Chrome DevTools → Network 탭 → "Disable cache" 체크

3. **충분한 데이터 로드** (대량 데이터 테스트 시)
   - "더 보기" 버튼을 여러 번 클릭하여 이슈 데이터 축적
   - 목표: 100개, 500개, 1000개 이상의 이슈 로드

---

## 측정 시나리오

### 시나리오 1: 초기 로드 성능

**목적**: 첫 페이지 로드 시 성능 측정

**절차**:
1. 브라우저 캐시 클리어
2. 개발 서버 재시작
3. Lighthouse 측정 실행
4. 결과 기록

**측정 항목**:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)

### 시나리오 2: 스크롤 성능 (대량 데이터)

**목적**: 많은 이슈가 로드된 상태에서 스크롤 성능 측정

**절차**:
1. 개발 서버 실행
2. "더 보기" 버튼을 여러 번 클릭하여 데이터 축적
   - 100개 이슈 로드
   - 500개 이슈 로드
   - 1000개 이상 이슈 로드
3. Chrome DevTools Performance로 측정
4. 스크롤 동작 수행 (위아래 스크롤)
5. 결과 분석

**측정 항목**:
- FPS (Frames Per Second) - 목표: 60fps
- 메모리 사용량
- DOM 노드 수
- 렌더링 시간

### 시나리오 3: 페이지네이션 성능

**목적**: "더 보기" 버튼 클릭 시 성능 측정

**절차**:
1. 개발 서버 실행
2. Chrome DevTools Performance로 측정 시작
3. "더 보기" 버튼 클릭
4. 다음 페이지 로드 완료까지 측정
5. 결과 분석

**측정 항목**:
- 다음 페이지 로드 시간
- 리렌더링 시간
- 네트워크 요청 시간

---

## 성능 측정 결과

### 측정 결과 기록 템플릿

각 우선순위별로 아래 템플릿을 사용하여 결과를 기록하세요.

```markdown
## [우선순위 X] 측정 결과 - YYYY-MM-DD

### 측정 환경
- **측정 일시**: YYYY-MM-DD HH:MM
- **브라우저**: Chrome XX.X
- **OS**: macOS/Windows/Linux
- **로드된 이슈 수**: XXX개

### Lighthouse 점수
- **Performance**: XX / 100
- **Accessibility**: XX / 100
- **Best Practices**: XX / 100
- **SEO**: XX / 100

### 주요 메트릭
- **First Contentful Paint (FCP)**: X.XX초
- **Largest Contentful Paint (LCP)**: X.XX초
- **Total Blocking Time (TBT)**: XXXms
- **Cumulative Layout Shift (CLS)**: X.XXX

### 렌더링 성능 (Chrome DevTools)
- **평균 FPS**: XX fps
- **메모리 사용량**: XXX MB
- **DOM 노드 수**: X,XXX개

### 개선 사항
- (이전 버전 대비 개선된 점)

### 리포트 파일
- HTML 리포트: `report-YYYY-MM-DD.html`
- JSON 리포트: `report-YYYY-MM-DD.json`
```

---

## 우선순위별 측정 체크리스트

### ✅ 우선순위 1: 기본 이슈 목록 표시 (완료)

- [ ] 초기 로드 성능 측정
- [ ] 100개 이슈 로드 후 스크롤 성능 측정
- [ ] 500개 이슈 로드 후 스크롤 성능 측정
- [ ] 결과 기록

**결과 파일**: `baseline-2025-11-12.md`

---

### ⏳ 우선순위 2: 무한 스크롤 구현 후

- [ ] 초기 로드 성능 측정
- [ ] 무한 스크롤 동작 성능 측정
- [ ] 1000개 이상 이슈 로드 후 스크롤 성능 측정
- [ ] 우선순위 1과 비교 분석
- [ ] 결과 기록

**결과 파일**: `infinite-scroll-YYYY-MM-DD.md`

---

### ⏳ 우선순위 3: 가상 스크롤 적용 후

- [ ] 초기 로드 성능 측정
- [ ] 가상 스크롤 동작 성능 측정
- [ ] 10,000개 이상 이슈 로드 후 스크롤 성능 측정
- [ ] 우선순위 1, 2와 비교 분석
- [ ] 결과 기록

**결과 파일**: `virtual-scroll-YYYY-MM-DD.md`

---

## Chrome DevTools Performance 사용법

### 기본 사용법

1. **Performance 탭 열기**
   - 개발자 도구 (F12) → Performance 탭

2. **측정 시작**
   - 좌측 상단의 **Record** 버튼 클릭
   - 또는 `Ctrl+E` (Windows/Linux) / `Cmd+E` (Mac)

3. **동작 수행**
   - 페이지 로드
   - 스크롤
   - 버튼 클릭 등

4. **측정 중지**
   - **Stop** 버튼 클릭
   - 또는 `Ctrl+E` / `Cmd+E` 다시 누르기

5. **결과 분석**
   - **FPS**: 상단 그래프에서 프레임 레이트 확인 (목표: 60fps)
   - **CPU**: CPU 사용률 확인
   - **NET**: 네트워크 요청 확인
   - **HEAP**: 메모리 사용량 확인

### 주요 분석 포인트

#### FPS (Frames Per Second)
- **목표**: 60fps 유지
- **주의**: 30fps 이하로 떨어지면 성능 문제

#### 메모리 사용량
- **목표**: 지속적으로 증가하지 않음
- **주의**: 메모리 누수 확인 (계속 증가하면 문제)

#### 렌더링 시간
- **목표**: 각 프레임이 16.67ms 이하 (60fps 기준)
- **주의**: 긴 작업(Long Task) 확인

### 성능 병목 지점 찾기

1. **Flame Chart** 확인
   - 긴 막대가 있는 부분이 병목 지점
   - JavaScript 실행 시간 확인

2. **Bottom-Up** 탭 확인
   - 가장 오래 걸린 함수 확인
   - Self Time이 큰 함수가 최적화 대상

3. **Call Tree** 탭 확인
   - 함수 호출 스택 확인
   - 불필요한 리렌더링 원인 파악

---

## 성능 개선 목표

### 현재 목표 (우선순위 1 기준)

- **Lighthouse Performance**: 80점 이상
- **FPS**: 60fps 유지 (100개 이슈)
- **초기 로드**: 3초 이내

### 최종 목표 (우선순위 3 완료 후)

- **Lighthouse Performance**: 90점 이상
- **FPS**: 60fps 유지 (10,000개 이상 이슈)
- **초기 로드**: 2초 이내
- **스크롤**: 부드러운 스크롤 (60fps 유지)

---

## 참고 자료

- [Lighthouse 공식 문서](https://developer.chrome.com/docs/lighthouse/)
- [Chrome DevTools Performance 가이드](https://developer.chrome.com/docs/devtools/performance/)
- [Web Vitals](https://web.dev/vitals/)

---

## 주의사항

1. **측정 환경 일관성**
   - 동일한 환경에서 측정 (같은 브라우저, 같은 OS)
   - 다른 애플리케이션 종료 (CPU/메모리 영향 최소화)

2. **프로덕션 빌드로도 측정**
   - 개발 모드와 프로덕션 모드의 성능 차이 확인
   - `npm run build && npm start` 후 측정

3. **여러 번 측정**
   - 한 번의 측정으로 판단하지 말고 여러 번 측정하여 평균값 사용
   - Lighthouse CI는 기본적으로 3회 측정 후 평균값 사용

4. **대량 데이터 테스트**
   - 실제 사용 시나리오를 고려하여 충분한 데이터 로드
   - 10만 건 목표를 위해 단계적으로 테스트

