// Breadcrumb Component
export const Breadcrumb = () => (
    <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
                <a href="/user/dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Dashboard
                </a>
            </li>
            <li>
                <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Book a Mechanic</span>
                </div>
            </li>
        </ol>
    </nav>
);