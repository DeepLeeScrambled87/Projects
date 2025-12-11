export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-32 animate-pulse">
        <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 min-w-0">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 space-y-4">
                        <div className="flex justify-between">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                        </div>
                        <div className="pt-4 mt-auto">
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
