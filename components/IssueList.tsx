"use client";

import { useIssues, filterOutPullRequests } from "@/hooks/useIssues";
import { GitHubIssue } from "@/lib/api";

function IssueItem({ issue }: { issue: GitHubIssue }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                issue.state === "open"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {issue.state === "open" ? "열림" : "닫힘"}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              #{issue.number}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {issue.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{issue.user.login}</span>
            <span>•</span>
            <span>{formatDate(issue.created_at)}</span>
            {issue.comments > 0 && (
              <>
                <span>•</span>
                <span>{issue.comments}개의 댓글</span>
              </>
            )}
          </div>
          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {issue.labels.map((label) => (
                <span
                  key={label.id}
                  className="px-2 py-1 text-xs font-medium rounded"
                  style={{
                    backgroundColor: `#${label.color}20`,
                    color: `#${label.color}`,
                    border: `1px solid #${label.color}40`,
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function IssueList() {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useIssues();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 dark:text-red-400 mb-2">
          오류가 발생했습니다
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {error instanceof Error ? error.message : "알 수 없는 오류"}
        </div>
      </div>
    );
  }

  // 모든 페이지의 이슈를 평탄화하고 PR 제외
  const allIssues = data?.pages.flatMap((page) => filterOutPullRequests(page)) ?? [];

  if (allIssues.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          표시할 이슈가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {allIssues.map((issue) => (
            <IssueItem key={issue.id} issue={issue} />
          ))}
        </div>
        {hasNextPage && (
          <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetchingNextPage ? "로딩 중..." : "더 보기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

