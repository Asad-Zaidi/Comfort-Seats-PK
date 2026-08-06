const TrafficSources = ({ trafficSources = [] }) => {
    return (
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Traffic Sources</h3>
            <p className="text-xs text-gray-500 mb-4">Calculated dynamically from MongoDB sessions (no hardcoded data)</p>

            <div className="space-y-3">
                {trafficSources.map((source) => (
                    <div key={source.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-700 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: source.color || "#2F6FED" }} />
                                {source.name}
                            </span>
                            <span className="font-bold text-gray-900">{source.pct}% ({source.count || 0})</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${source.pct}%`, backgroundColor: source.color || "#2F6FED" }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrafficSources;
