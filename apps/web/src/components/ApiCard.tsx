import { Api } from '@/types';

interface ApiCardProps {
  api: Api;
}

export const ApiCard = ({ api }: ApiCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={api.name}>
          {api.name}
        </h3>
        {api.https && (
            <span className="flex-shrink-0 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-300">HTTPS</span>
        )}
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow line-clamp-3">
        {api.description || 'No description available'}
      </p>

      <div className="mt-auto space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div>
            <span className="font-semibold block text-gray-700 dark:text-gray-200">Auth</span>
            {api.authMethods.length > 0 
                ? api.authMethods.map(a => a.name).join(', ') 
                : 'None'}
          </div>
          <div>
            <span className="font-semibold block text-gray-700 dark:text-gray-200">CORS</span>
            {api.cors || 'Unknown'}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
            {api.categories.map(cat => (
                <span key={cat.id} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                    {cat.name}
                </span>
            ))}
        </div>
        
        <div className="pt-3 flex justify-between items-center border-t border-gray-100 dark:border-gray-700 mt-2">
            <div className="flex gap-2">
                 <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 cursor-help" title="Latency (Placeholder)">
                    ⚡ - ms
                 </span>
                 <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 rounded dark:bg-emerald-900/20 dark:text-emerald-400 cursor-help" title="Uptime (Placeholder)">
                    99.9%
                 </span>
            </div>

            <a 
              href={api.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center"
            >
              Visit <span className="ml-1">→</span>
            </a>
        </div>
      </div>
    </div>
  );
};
