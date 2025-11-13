"use client";

import { useIssues, filterOutPullRequests } from "@/hooks/useIssues";
import { GitHubIssue } from "@/lib/api";
import { useEffect, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

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
  
  // 가상 스크롤 컨테이너 참조
  const parentRef = useRef<HTMLDivElement>(null);
  // fetchNextPage의 최신 참조를 유지하기 위한 ref
  const fetchNextPageRef = useRef(fetchNextPage);

  // fetchNextPage 참조 업데이트
  useEffect(() => {
    fetchNextPageRef.current = fetchNextPage;
  }, [fetchNextPage]);

  // 모든 페이지의 이슈를 평탄화하고 PR 제외
  const allIssues = useMemo(
    () => data?.pages.flatMap((page) => filterOutPullRequests(page)) ?? [],
    [data]
  );

  // 가상 스크롤 설정
  const virtualizer = useVirtualizer({
    count: allIssues.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // 각 아이템의 예상 높이 (px)
    overscan: 5, // 뷰포트 밖에 렌더링할 추가 아이템 수
  });

  // 가상화된 아이템이 마지막에 가까워지면 다음 페이지 로드
  // 스크롤 이벤트를 직접 감지하여 불필요한 재실행 방지
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) {
      return;
    }

    const handleScroll = () => {
      // 스크롤이 하단에 가까워졌는지 확인
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;
      
      // 하단 200px 이내에 도달하면 다음 페이지 로드
      if (
        scrollBottom < 200 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPageRef.current();
      }
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    // 초기 체크 (이미 스크롤이 하단에 있는 경우)
    handleScroll();

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [hasNextPage, isFetchingNextPage]);

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

  if (allIssues.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          표시할 이슈가 없습니다
        </div>
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* 가상 스크롤 컨테이너 */}
        <div
          ref={parentRef}
          style={{
            height: `600px`, // 컨테이너 높이 설정
            overflow: 'auto',
          }}
        >
          {/* 가상 스크롤 래퍼 (상대 위치) */}
          <div
            style={{
              height: `${totalSize}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {/* 가상화된 아이템 렌더링 */}
            {virtualItems.map((virtualItem) => {
              const issue = allIssues[virtualItem.index];
              if (!issue) {
                return null;
              }
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <IssueItem issue={issue} />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 로딩 상태 표시 */}
        {isFetchingNextPage && (
          <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
            <div className="text-gray-500 dark:text-gray-400">
              Loading more…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

