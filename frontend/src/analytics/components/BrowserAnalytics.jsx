const BrowserAnalytics = ({ browserAnalytics = [] }) => {
    return (
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Browser Analytics</h3>
            <p className="text-xs text-gray-500 mb-4">Chrome, Edge, Firefox, Safari, Samsung Internet</p>

            <div className="space-y-3">
                {browserAnalytics.length === 0 ? (
                    <p className="py-6 text-center text-xs text-gray-400">Browser statistics will appear as visitors arrive.</p>
                ) : (
                    browserAnalytics.map((b) => (
                        <div key={b.browser} className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-xs">
                            <span className="font-medium text-gray-800">{b.browser}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-900">{b.pct}%</span>
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700">{b.count} visitors</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BrowserAnalytics;
