# GitHub Issue Viewer

facebook/react 저장소의 GitHub Issues를 실시간으로 조회하고, 대용량 데이터를 효율적으로 가상 스크롤로 표시하는 웹 애플리케이션입니다.

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **상태 관리**: Zustand
- **데이터 페칭**: React Query (@tanstack/react-query)
- **가상 스크롤**: @tanstack/react-virtual
- **스타일링**: Tailwind CSS + shadcn/ui
- **배포**: Vercel

## 주요 기능

- 이슈 목록 조회 (무한 스크롤)
- 가상 스크롤을 통한 성능 최적화
- 이슈 필터링 (state, labels, sort, direction)
- 이슈 상세보기 (Side Panel)
- Rate Limit 관리

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 환경 변수 설정

`.env.local` 파일을 생성하고 GitHub Personal Access Token을 설정하세요:

```env
GITHUB_TOKEN=your_personal_access_token
```

## 배포

이 프로젝트는 Vercel에 배포됩니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/github-issue-viewer)

## 참고 문서

- [PRD 문서](./docs/prd.md)

