# 성능 측정 도구 가이드

이 문서는 GitHub Issue Viewer 프로젝트에서 사용하는 성능 측정 도구들에 대해 설명합니다.

## 목차

- [자동화 도구와 측정 도구의 관계](#자동화-도구와-측정-도구의-관계)
- [측정 도구 개요](#측정-도구-개요)
- [도구별 상세 설명](#도구별-상세-설명)
- [언제 어떤 도구를 사용할까?](#언제-어떤-도구를-사용할까)
- [측정 도구 비교표](#측정-도구-비교표)

---

## 자동화 도구와 측정 도구의 관계

### 핵심 개념

성능 측정 자동화는 **두 가지 요소**로 구성됩니다:

1. **자동화 도구**: 브라우저를 제어하고 사용자 상호작용을 시뮬레이션
2. **측정 도구**: 실제 성능을 측정

### Puppeteer = 자동화 도구

**Puppeteer**는 브라우저 자동화 도구입니다:
- 브라우저 자동 실행
- 페이지 자동 로드
- "더 보기" 버튼 자동 클릭
- 사용자 상호작용 시뮬레이션

**역할**: 로봇 팔처럼 자동으로 작업을 수행합니다.

### 측정 도구 (선택)

측정 도구는 두 가지 옵션이 있습니다:

1. **Lighthouse CLI** - 초기 페이지 로드 성능 측정
2. **Chrome DevTools Performance API** - 현재 페이지 상태 측정

**역할**: 실제 성능을 측정합니다.

### 두 가지 조합

#### 조합 1: Puppeteer + Lighthouse CLI
```
Puppeteer (자동화) → 페이지 로드 → 버튼 클릭 → Lighthouse CLI (측정)
```
- 파일: `performance-test.ts`
- 명령어: `npm run perf:auto:500`
- 결과: 초기 로드만 측정 (Lighthouse CLI가 새 페이지를 로드함)

#### 조합 2: Puppeteer + Chrome DevTools Performance API ⭐
```
Puppeteer (자동화) → 페이지 로드 → 버튼 클릭 → Performance API (측정)
```
- 파일: `performance-devtools.ts`
- 명령어: `npm run perf:devtools:500`
- 결과: 현재 페이지 상태(500개 이슈) 측정

### 구조 정리

| 항목 | 역할 | 예시 |
|------|------|------|
| **Puppeteer** | 자동화 도구 | 브라우저 제어, 버튼 클릭 |
| **Lighthouse CLI** | 측정 도구 옵션 1 | 초기 로드 측정 |
| **Chrome DevTools Performance API** | 측정 도구 옵션 2 | 현재 상태 측정 |

**결론**: Puppeteer는 자동화를 위한 도구이고, 측정은 Lighthouse CLI 또는 Performance API 중 선택합니다.

---

## 측정 도구 개요

프로젝트에서 사용하는 성능 측정 도구는 총 4가지입니다:

1. **Lighthouse CLI** - 초기 페이지 로드 성능 측정 (수동)
2. **Chrome DevTools Performance (수동)** - 상세한 렌더링 성능 분석 (수동)
3. **Lighthouse 자동화 스크립트** - Puppeteer + Lighthouse CLI 조합
4. **Chrome DevTools Performance 자동화 스크립트** - Puppeteer + Performance API 조합 ⭐

---

## 도구별 상세 설명

### 1. Lighthouse CLI

#### 특징
- **측정 범위**: 초기 페이지 로드만 측정
- **측정 방식**: URL을 직접 호출하여 새 페이지를 로드하고 측정
- **측정 항목**: Performance, Accessibility, Best Practices, SEO 점수 및 Core Web Vitals

#### 왜 추가되었는가?
- 가장 간단하고 빠르게 초기 로드 성능을 측정할 수 있음
- Google의 공식 성능 측정 도구로 신뢰성 높음
- Core Web Vitals (FCP, LCP, TBT, CLS) 등 표준 메트릭 제공
- CI/CD 파이프라인에 통합 가능

#### 사용 방법
```bash
# HTML 리포트 생성
npm run perf:measure

# JSON 리포트 생성
npm run perf:json
```

#### 장점
- ✅ 설정이 간단함
- ✅ 표준화된 성능 메트릭 제공
- ✅ HTML 리포트로 시각적 분석 가능
- ✅ 빠른 측정 (약 30-60초)

#### 단점
- ❌ 초기 페이지 로드만 측정 (사용자 상호작용 불가)
- ❌ "더 보기" 버튼 클릭 후 추가된 이슈는 측정 불가
- ❌ 대량 데이터 로드 후 성능 차이를 확인할 수 없음

#### 사용 시나리오
- 초기 페이지 로드 성능 확인
- Core Web Vitals 측정
- 프로덕션 배포 전 성능 검증
- CI/CD 파이프라인 통합

---

### 2. Chrome DevTools Performance (수동 측정)

#### 특징
- **측정 범위**: 사용자 상호작용 포함 측정 가능
- **측정 방식**: 브라우저 개발자 도구에서 수동으로 측정
- **측정 항목**: FPS, 메모리 사용량, DOM 노드 수, 메인 스레드 시간, 긴 작업(Long Tasks)

#### 왜 추가되었는가?
- Lighthouse로는 측정할 수 없는 상세한 렌더링 성능 분석 필요
- 스크롤 성능, 메모리 사용량 등 런타임 성능 측정 필요
- 대량 데이터 로드 후 성능 차이 확인 필요

#### 사용 방법
1. 개발 서버 실행: `npm run dev`
2. Chrome 브라우저에서 `http://localhost:3003` 접속
3. 개발자 도구 열기 (F12)
4. Performance 탭 선택
5. Record 버튼 클릭
6. 페이지 로드 및 스크롤 동작 수행
7. Stop 버튼 클릭
8. 결과 분석

#### 장점
- ✅ 사용자 상호작용 포함 측정 가능
- ✅ 매우 상세한 성능 분석 가능
- ✅ FPS, 메모리 등 런타임 메트릭 측정
- ✅ 긴 작업(Long Tasks) 식별 가능

#### 단점
- ❌ 수동 작업 필요 (자동화 어려움)
- ❌ 측정 결과를 파일로 저장하기 어려움
- ❌ 반복 측정 시 일관성 유지 어려움
- ❌ 학습 곡선이 있음

#### 사용 시나리오
- 스크롤 성능 문제 디버깅
- 메모리 누수 확인
- 긴 작업(Long Tasks) 식별
- 대량 데이터에서의 성능 문제 분석

---

### 3. Lighthouse 자동화 스크립트 (`performance-test.ts`)

#### 특징
- **구성**: Puppeteer (자동화) + Lighthouse CLI (측정)
- **측정 범위**: 초기 페이지 로드만 측정 (Lighthouse CLI와 동일)
- **측정 방식**: Puppeteer로 사용자 상호작용 시뮬레이션 후 Lighthouse CLI 실행
- **측정 항목**: Lighthouse CLI와 동일

#### 왜 추가되었는가?
- 사용자 상호작용("더 보기" 버튼 클릭 등)을 자동화하고 싶었음
- 반복 측정 시 일관된 결과를 얻고 싶었음
- 수동 작업 없이 자동으로 측정하고 싶었음

#### 사용 방법
```bash
# 500개 이슈 로드 후 측정
npm run perf:auto:500

# 다른 시나리오
npm run perf:auto:initial  # 초기 로드
npm run perf:auto:1000      # 1000개 이슈
npm run perf:auto:scroll    # 스크롤 성능
npm run perf:auto           # 모든 시나리오
```

#### 동작 방식
1. **Puppeteer**로 브라우저 자동 실행
2. **Puppeteer**로 페이지 로드
3. **Puppeteer**로 "더 보기" 버튼 자동 클릭 (시나리오에 따라)
4. **Lighthouse CLI** 실행 (`npx lighthouse "http://localhost:3003"`) - 새 페이지 로드
5. 결과를 JSON 파일로 저장

#### 장점
- ✅ 사용자 상호작용 자동화
- ✅ 반복 측정 시 일관된 결과
- ✅ 수동 작업 불필요
- ✅ 여러 시나리오를 한 번에 실행 가능

#### 단점
- ❌ Lighthouse CLI를 별도로 실행하므로 새 페이지를 로드함
- ❌ Puppeteer로 준비한 500개 이슈 상태가 아닌 초기 상태를 측정함
- ❌ "더 보기" 버튼 클릭 후 추가된 이슈는 측정에 포함되지 않음
- ❌ 실제로는 Lighthouse CLI와 동일한 결과를 얻음

#### 사용 시나리오
- 초기 로드 성능을 여러 시나리오에서 자동 측정
- CI/CD 파이프라인에 통합하여 자동화된 성능 테스트
- 반복 측정이 필요한 경우

#### 한계
**⚠️ 중요**: 이 스크립트는 Puppeteer로 "더 보기" 버튼을 클릭하여 500개 이슈를 로드하지만, Lighthouse CLI가 별도 프로세스로 실행되어 새 페이지를 로드합니다. 따라서 실제로는 초기 상태(100개 이슈)만 측정하며, Lighthouse CLI와 동일한 결과를 얻습니다.

---

### 4. Chrome DevTools Performance 자동화 스크립트 (`performance-devtools.ts`) ⭐

#### 특징
- **구성**: Puppeteer (자동화) + Chrome DevTools Performance API (측정)
- **측정 범위**: 이미 로드된 페이지의 현재 상태를 직접 측정
- **측정 방식**: Puppeteer의 Performance API를 사용하여 현재 페이지 상태 측정
- **측정 항목**: DOM 노드 수, 이슈 아이템 수, 메모리 사용량, Performance API 메트릭

#### 왜 추가되었는가?
- Lighthouse 자동화 스크립트의 한계를 해결하기 위해 추가됨
- "더 보기" 버튼 클릭 후 추가된 이슈도 포함하여 측정하고 싶었음
- 대량 데이터 로드 전후의 성능 차이를 정확히 측정하고 싶었음
- DOM 노드 수, 메모리 사용량 등 런타임 메트릭을 자동으로 측정하고 싶었음

#### 사용 방법
```bash
# 500개 이슈 로드 후 측정
npm run perf:devtools:500

# 다른 시나리오
npm run perf:devtools:initial  # 초기 로드
npm run perf:devtools:1000     # 1000개 이슈
npm run perf:devtools:scroll   # 스크롤 성능
npm run perf:devtools          # 모든 시나리오
```

#### 동작 방식
1. **Puppeteer**로 브라우저 자동 실행
2. **Puppeteer**로 페이지 로드
3. **Puppeteer**로 "더 보기" 버튼 자동 클릭 (시나리오에 따라)
4. **Puppeteer의 `page.evaluate()`**로 Performance API 직접 호출하여 현재 페이지 상태 측정
5. DOM 노드 수, 메모리 사용량 등 수집
6. 결과를 JSON 파일로 저장

#### 장점
- ✅ "더 보기" 버튼 클릭 후 추가된 이슈도 측정 가능
- ✅ 현재 페이지 상태를 직접 측정 (Lighthouse와 달리)
- ✅ DOM 노드 수, 메모리 사용량 등 상세 메트릭 제공
- ✅ 대량 데이터 로드 전후 비교 가능
- ✅ 반복 측정 시 일관된 결과
- ✅ 수동 작업 불필요

#### 단점
- ❌ Lighthouse의 Core Web Vitals (LCP, TBT 등)는 측정하지 않음
- ❌ FPS 측정은 별도 구현 필요
- ❌ Performance API만으로는 일부 메트릭 측정 제한적

#### 사용 시나리오
- 대량 데이터 로드 후 성능 차이 확인
- DOM 노드 수 증가 추이 확인
- 메모리 사용량 모니터링
- 가상 스크롤 적용 전후 비교
- 우선순위 2, 3 구현 후 성능 개선 효과 확인

#### 실제 측정 결과 예시
- **초기 로드 (100개)**: DOM 노드 552개, 이슈 35개, 메모리 43.43 MB
- **500개 이슈**: DOM 노드 2,105개, 이슈 139개, 메모리 48.48 MB
- **차이**: DOM 노드 3.8배 증가, 이슈 4.0배 증가, 메모리 +11.6%

---

## 언제 어떤 도구를 사용할까?

### 시나리오별 추천 도구

#### 1. 초기 페이지 로드 성능 확인
**추천**: Lighthouse CLI 또는 Lighthouse 자동화 스크립트
- Core Web Vitals 측정 필요
- 표준화된 성능 점수 필요
- 빠른 측정 필요

#### 2. 대량 데이터 로드 후 성능 차이 확인
**추천**: Chrome DevTools Performance 자동화 스크립트 ⭐
- "더 보기" 버튼 클릭 후 추가된 이슈 포함 측정 필요
- DOM 노드 수, 메모리 사용량 등 런타임 메트릭 필요
- 대량 데이터 로드 전후 비교 필요

#### 3. 스크롤 성능 문제 디버깅
**추천**: Chrome DevTools Performance (수동) 또는 Chrome DevTools Performance 자동화 스크립트
- FPS 측정 필요
- 긴 작업(Long Tasks) 식별 필요
- 상세한 성능 분석 필요

#### 4. CI/CD 파이프라인 통합
**추천**: Lighthouse CLI 또는 Lighthouse 자동화 스크립트
- 자동화된 성능 테스트 필요
- 표준화된 메트릭 필요
- 빠른 측정 필요

#### 5. 가상 스크롤 적용 전후 비교
**추천**: Chrome DevTools Performance 자동화 스크립트 ⭐
- DOM 노드 수 감소 효과 확인
- 메모리 사용량 개선 확인
- 대량 데이터에서의 성능 개선 확인

---

## 측정 도구 비교표

| 항목 | Lighthouse CLI | Chrome DevTools (수동) | Lighthouse 자동화 | DevTools 자동화 ⭐ |
|------|---------------|----------------------|------------------|------------------|
| **자동화 도구** | 없음 (수동) | 없음 (수동) | Puppeteer | Puppeteer |
| **측정 도구** | Lighthouse CLI | Chrome DevTools | Lighthouse CLI | Performance API |
| **측정 범위** | 초기 로드만 | 사용자 상호작용 포함 | 초기 로드만 | 현재 페이지 상태 |
| **자동화** | ❌ | ❌ | ✅ | ✅ |
| **Core Web Vitals** | ✅ | ❌ | ✅ | ❌ |
| **DOM 노드 수** | ❌ | ✅ | ❌ | ✅ |
| **메모리 사용량** | ❌ | ✅ | ❌ | ✅ |
| **FPS 측정** | ❌ | ✅ | ❌ | ⚠️ 제한적 |
| **대량 데이터 측정** | ❌ | ✅ | ❌ | ✅ |
| **반복 측정** | ✅ | ❌ | ✅ | ✅ |
| **설정 난이도** | 쉬움 | 보통 | 보통 | 보통 |
| **측정 시간** | 30-60초 | 수동 | 1-2분 | 1-2분 |
| **결과 파일** | HTML, JSON | 없음 | JSON | JSON |

---

## 실제 사용 예시

### 예시 1: 기준선 측정 (우선순위 1)
```bash
# Lighthouse로 초기 로드 측정
npm run perf:auto:initial

# Chrome DevTools Performance로 대량 데이터 측정
npm run perf:devtools:500
```

### 예시 2: 무한 스크롤 적용 후 (우선순위 2)
```bash
# 동일한 방법으로 재측정
npm run perf:devtools:500

# 결과 비교하여 개선 효과 확인
```

### 예시 3: 가상 스크롤 적용 후 (우선순위 3)
```bash
# 동일한 방법으로 재측정
npm run perf:devtools:500

# DOM 노드 수 감소 확인 (예: 2,105개 → 500개 미만)
# 메모리 사용량 개선 확인
```

---

## 결론

### 도구 구성 요약

각 측정 도구는 다음과 같이 구성됩니다:

| 도구 | 자동화 도구 | 측정 도구 | 측정 범위 |
|------|-----------|----------|----------|
| **Lighthouse CLI** | 없음 (수동) | Lighthouse CLI | 초기 로드만 |
| **Chrome DevTools Performance (수동)** | 없음 (수동) | Chrome DevTools | 사용자 상호작용 포함 |
| **Lighthouse 자동화** | Puppeteer | Lighthouse CLI | 초기 로드만 |
| **Chrome DevTools Performance 자동화** ⭐ | Puppeteer | Performance API | 현재 페이지 상태 |

### 핵심 포인트

1. **Puppeteer는 자동화 도구**: 브라우저 제어 및 사용자 상호작용 시뮬레이션
2. **측정 도구는 선택**: Lighthouse CLI 또는 Performance API 중 선택
3. **조합이 중요**: Puppeteer + 측정 도구 = 자동화된 성능 측정

### 가장 추천하는 조합

1. **Lighthouse 자동화**: 초기 로드 성능 측정 (Core Web Vitals)
2. **Chrome DevTools Performance 자동화** ⭐: 대량 데이터 성능 측정 (DOM 노드, 메모리)

이 두 가지를 함께 사용하면 초기 로드 성능과 대량 데이터 성능을 모두 확인할 수 있습니다.

---

## 참고

- 성능 측정 가이드: [README.md](./README.md)
- 기준선 측정 결과: [baseline-2025-11-12.md](./baseline-2025-11-12.md)

