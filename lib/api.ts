/**
 * GitHub API 클라이언트
 */

const GITHUB_API_BASE = "https://api.github.com";
const REPO_OWNER = "facebook";
const REPO_NAME = "react";

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  comments: number;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  pull_request?: {
    url: string;
  };
}

export interface GitHubIssueComment {
  id: number;
  body: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface IssuesParams {
  state?: "open" | "closed" | "all";
  labels?: string;
  sort?: "created" | "updated" | "comments";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

/**
 * GitHub Issues 목록 조회
 */
export async function fetchIssues(
  params: IssuesParams = {}
): Promise<GitHubIssue[]> {
  const searchParams = new URLSearchParams();
  
  if (params.state) searchParams.set("state", params.state);
  if (params.labels) searchParams.set("labels", params.labels);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.direction) searchParams.set("direction", params.direction);
  searchParams.set("per_page", String(params.per_page || 100));
  if (params.page) searchParams.set("page", String(params.page));

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  // 환경 변수에서 토큰이 있으면 사용
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `token ${token}`;
  } else {
    console.warn("NEXT_PUBLIC_GITHUB_TOKEN이 설정되지 않았습니다. Rate limit이 60 req/h로 제한됩니다.");
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues?${searchParams}`,
    { headers }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    console.error("GitHub API Error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      url: `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
    });
    throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  
  // Rate limit 정보 추출 (선택사항)
  const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
  if (rateLimitRemaining) {
    console.log(`Rate limit remaining: ${rateLimitRemaining}`);
  }

  return data;
}

/**
 * 특정 이슈 상세 조회
 */
export async function fetchIssue(number: number): Promise<GitHubIssue> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`;
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${number}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

/**
 * 이슈 댓글 조회
 */
export async function fetchIssueComments(
  number: number,
  page: number = 1,
  perPage: number = 100
): Promise<GitHubIssueComment[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`;
  }

  const searchParams = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${number}/comments?${searchParams}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

