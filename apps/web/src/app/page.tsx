import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-8">
            API OS
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Modern API development platform built with Next.js 14, TypeScript, and Tailwind CSS
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Health Check
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                API endpoint for monitoring service status
              </p>
              <Link 
                href="/api/health" 
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Check Status
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Modern Stack
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Next.js 14 with App Router and TypeScript
              </p>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                React 18 • Next.js 14 • TypeScript
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Developer Experience
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                ESLint, Prettier, and Tailwind CSS configured
              </p>
              <div className="text-sm text-green-600 dark:text-green-400">
                Ready for development
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}