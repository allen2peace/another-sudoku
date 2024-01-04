import React from 'react';

function LoadingPage() {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="h-20 w-20 text-blue-600">
                <svg className="animate-spin mr-3 h-full w-full text-blue-500" fill="currentColor" viewBox="0 0 24 24" role="status">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <div className="text-xl text-blue-600">Loading...</div>
            </div>
        </div>
    );
}

export default LoadingPage;