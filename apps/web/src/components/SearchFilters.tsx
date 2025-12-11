'use client';

import { FacetsResponse } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchFiltersProps {
  facets: FacetsResponse;
}

export const SearchFilters = ({ facets }: SearchFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page on filter change
    params.set('page', '1');
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Category</h3>
        <select 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white text-sm py-2 px-3 border"
          value={searchParams.get('category') || ''}
          onChange={(e) => updateFilter('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {facets.categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Authentication</h3>
        <select 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white text-sm py-2 px-3 border"
          value={searchParams.get('auth') || ''}
          onChange={(e) => updateFilter('auth', e.target.value)}
        >
          <option value="">Any Auth</option>
          {facets.authMethods.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">HTTPS</h3>
        <select 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white text-sm py-2 px-3 border"
          value={searchParams.get('https') || ''}
          onChange={(e) => updateFilter('https', e.target.value)}
        >
          <option value="">Any</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">CORS</h3>
        <select 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white text-sm py-2 px-3 border"
          value={searchParams.get('cors') || ''}
          onChange={(e) => updateFilter('cors', e.target.value)}
        >
          <option value="">Any</option>
          {facets.cors.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      
      {/* Reset button */}
      {(searchParams.get('category') || searchParams.get('auth') || searchParams.get('https') || searchParams.get('cors') || searchParams.get('q')) && (
          <button 
            onClick={() => router.push('/')}
            className="w-full mt-4 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline"
          >
            Clear all filters
          </button>
      )}
    </div>
  );
};
