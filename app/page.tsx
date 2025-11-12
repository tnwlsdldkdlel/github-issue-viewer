import { IssueList } from "@/components/IssueList";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            GitHub Issue Viewer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            facebook/react 저장소의 이슈를 조회합니다.
          </p>
        </div>
        <IssueList />
      </div>
    </main>
  );
}

