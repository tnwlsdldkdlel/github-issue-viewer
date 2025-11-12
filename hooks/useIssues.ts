"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchIssues, type GitHubIssue, type IssuesParams } from "@/lib/api";

interface UseIssuesOptions extends Omit<IssuesParams, "page"> {
  enabled?: boolean;
}

export function useIssues(options: UseIssuesOptions = {}) {
  const {
    state = "all",
    labels,
    sort = "created",
    direction = "desc",
    per_page = 100,
    enabled = true,
  } = options;

  return useInfiniteQuery({
    queryKey: ["issues", { state, labels, sort, direction, per_page }],
    queryFn: ({ pageParam = 1 }) =>
      fetchIssues({
        state,
        labels,
        sort,
        direction,
        per_page,
        page: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지가 per_page보다 적으면 더 이상 페이지가 없음
      if (lastPage.length < per_page) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
    enabled,
  });
}

/**
 * PR을 제외한 이슈만 필터링하는 헬퍼 함수
 */
export function filterOutPullRequests(issues: GitHubIssue[]): GitHubIssue[] {
  return issues.filter((issue) => !issue.pull_request);
}

