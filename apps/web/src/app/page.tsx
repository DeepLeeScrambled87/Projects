import { SearchInput } from '@/components/SearchInput';
import { SearchFilters } from '@/components/SearchFilters';
import { ApiCard } from '@/components/ApiCard';
import { Pagination } from '@/components/Pagination';
import { searchApis, getFacets } from '@/services/search';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const auth = typeof searchParams.auth === 'string' ? searchParams.auth : undefined;
  const https = typeof searchParams.https === 'string' ? searchParams.https : undefined;
  const cors = typeof searchParams.cors === 'string' ? searchParams.cors : undefined;

  // Parallel data fetching
  const [searchResults, facets] = await Promise.all([
    searchApis({ q, category, auth, https, cors, page }),
    getFacets(),
  ]);

  // Serialize data for Client Components (Dates to strings)
  const serializedApis = searchResults.data.map(api => ({
    ...api,
    createdAt: api.createdAt.toISOString(),
    updatedAt: api.updatedAt.toISOString(),
    lastFetched: api.lastFetched.toISOString(),
    reliabilityStats: api.reliabilityStats ? {
      ...api.reliabilityStats,
      lastChecked: api.reliabilityStats.lastChecked?.toISOString() ?? null
    } : null
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">API Discovery</h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Explore our curated directory of <span className="font-semibold text-blue-600 dark:text-blue-400">{searchResults.meta.total}</span> public APIs. 
            Filter by category, authentication, and more.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-8">
                <SearchFilters facets={facets} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="mb-6">
              <SearchInput />
            </div>
            
            {serializedApis.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No APIs found</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  We couldn't find any APIs matching your search criteria. Try adjusting your filters or search term.
                </p>
                <div className="mt-6">
                    <a href="/" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                        Clear all filters
                    </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {serializedApis.map((api) => (
                  <ApiCard key={api.id} api={api} />
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                <Pagination 
                currentPage={searchResults.meta.page} 
                totalPages={searchResults.meta.totalPages} 
                />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
