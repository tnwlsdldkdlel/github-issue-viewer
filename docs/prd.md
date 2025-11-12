# 🧭 GitHub Issue Viewer — PRD

## 1. 프로젝트 개요
**프로젝트명:** GitHub Issue Viewer  
**목적:**  
facebook/react 저장소의 GitHub Issues를 실시간으로 조회하고,  
대용량 데이터를 효율적으로 가상 스크롤(Virtualized Table)로 표시하며,  
검색·필터링·상세보기 기능을 제공하는 웹 애플리케이션을 구현한다.

**핵심 목표:**
- 대량 데이터(수만 건) 렌더링 성능 최적화
- GitHub REST API 기반 데이터 구조 이해
- React Query + Virtualization을 통한 UX 성능 실험
- 프론트엔드 실무 감각(비동기 흐름, 캐싱, 오프라인 UX) 습득

---

## 2. 프로젝트 요약

| 항목 | 내용 |
|------|------|
| **프로젝트명** | GitHub Issue Viewer |
| **데이터 출처** | [https://api.github.com/repos/facebook/react/issues](https://api.github.com/repos/facebook/react/issues) |
| **대상 저장소** | `facebook/react` |
| **핵심 기술 스택** | Next.js 14 (App Router), TypeScript, React Query, TanStack Virtual, Zustand, Tailwind CSS |
| **개발 목표** | 10만 건 이상 이슈를 부드럽게 렌더링하는 고성능 데이터 뷰어 |
| **주요 기능** | Infinite Scroll, Virtualized Table, Filtering, Label/State/Sort, Issue Detail View |
| **결과물** | 배포 가능한 Next.js 웹앱 (Vercel) |

---

## 3. 주요 기능 정의

### 3.1 이슈 목록 조회
- **설명:**  
  GitHub Issues API를 통해 facebook/react의 공개 이슈 데이터를 페이징 단위로 불러온다.
- **세부 요구사항:**
  - `per_page=100` 단위로 요청
  - Infinite Scroll 방식으로 페이지 자동 로드
  - 가상 스크롤(Virtualized List) 적용으로 렌더링 최적화
  - `pull_request` 필드가 존재하는 항목(PR)은 목록에서 제외

### 3.2 이슈 필터링
- **항목:**
  - `state`: open / closed / all
  - `labels`: 다중 라벨 필터 (쉼표로 구분)
  - `sort`: created / updated / comments
  - `direction`: asc / desc
- **UI:**
  - 상단 FilterBar에서 select + input으로 조정
  - Query param 또는 Zustand 상태로 관리

### 3.3 상세보기 (Side Panel)
- **설명:**  
  클릭한 이슈의 상세 정보와 댓글을 별도 패널에 표시
- **데이터:**  
  `/issues/{number}` → 이슈 상세  
  `/issues/{number}/comments` → 댓글 목록
- **UX:**
  - 목록 클릭 시 우측 패널 슬라이드 오픈
  - 댓글은 최대 100개 단위 페이징 (스크롤 하단 로드)

### 3.4 무한 스크롤
- **기능:**  
  `useInfiniteQuery` + Intersection Observer 기반 무한 로딩
- **조건:**  
  하단 sentinel 노출 시 다음 페이지 요청
- **캐싱:**  
  React Query로 페이지별 데이터 캐싱
- **성능:**  
  가상 스크롤과 조합 시 10만 건 수준에서도 부드러운 렌더링

### 3.5 Rate Limit 관리
- **GitHub API 제한:**
  - 비인증: 60 req/h  
  - 인증(토큰): 5000 req/h
- **대응:**  
  - `.env.local`의 Personal Access Token 사용  
  - `X-RateLimit-Remaining` 헤더를 읽어 남은 요청 수 표시
  - 남은 요청이 0일 경우, 경고 메시지 출력

### 3.6 UI/UX 세부 요소
| 항목 | 설명 |
|------|------|
| **로딩 상태** | Skeleton 또는 "Loading more…" 표시 |
| **에러 상태** | API 실패 시 Retry 버튼 표시 |
| **Empty State** | 조건에 맞는 이슈가 없을 경우 메시지 출력 |
| **테이블 행 hover 효과** | 클릭 가능성 강조 |
| **라벨 색상 표시** | GitHub 라벨 색상(hex) 반영 |
| **반응형 지원** | PC 기준 2열(Grid: Table + Detail), 모바일은 상하 스택 |
| **Dark Mode (선택)** | Tailwind class 기반 다크테마 추가 가능 |

---

## 4. 기술 설계

### 4.1 주요 라이브러리
| 분류 | 라이브러리 | 용도 |
|------|-------------|------|
| 프레임워크 | **Next.js (App Router)** | SSR, CSR 혼합 실험 |
| 상태관리 | **Zustand** | 선택 이슈 및 UI 상태 공유 |
| 데이터 | **React Query** | 무한 스크롤, 캐싱, Stale 관리 |
| 렌더링 | **@tanstack/react-virtual** | Virtualized List |
| UI | **Tailwind CSS + shadcn/ui** | 기본 UI 구성 |
| 요청 | **Fetch API** | GitHub REST 호출 |
| 배포 | **Vercel** | CI/CD 및 프리뷰 환경 구성 |

### 4.2 API 구조
```text
GET /repos/facebook/react/issues
  → per_page, page, state, labels, sort, direction

GET /repos/facebook/react/issues/{number}
  → 상세 정보

GET /repos/facebook/react/issues/{number}/comments
  → 댓글 목록