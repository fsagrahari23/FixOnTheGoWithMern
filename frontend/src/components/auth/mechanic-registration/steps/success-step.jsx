"use client"

import { CheckCircle, Download, Share2 } from "lucide-react"

export default function SuccessStep() {
    return (
        <div className="space-y-6 text-center">
            <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>

            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Registration Complete!</h2>
                <p className="text-gray-600 dark:text-gray-400">Your mechanic profile has been successfully created</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">What's next?</p>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <li>✓ Your profile is now active</li>
                    <li>✓ You can start accepting jobs</li>
                    <li>✓ Check your email for confirmation</li>
                </ul>
            </div>

            <div className="flex gap-3">
                <button className="flex-1 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Certificate
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share Profile
                </button>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
                <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Return to Home
                </a>
            </div>
        </div>
    )
}
