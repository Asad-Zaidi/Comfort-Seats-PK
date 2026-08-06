import { FiGlobe, FiMapPin } from "react-icons/fi";

const LocationAnalytics = ({ topCountries = [], topCities = [] }) => {
    return (
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <FiGlobe className="text-emerald-500" size={18} />
                Geographic & Location Analytics
            </h3>
            <p className="text-xs text-gray-500 mb-5">Real-time IP Geolocation lookup</p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Top Countries */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                        <FiGlobe size={13} /> Top Countries
                    </h4>
                    <div className="space-y-2">
                        {topCountries.length === 0 ? (
                            <p className="text-xs text-gray-400">Pakistan (100%)</p>
                        ) : (
                            topCountries.map((c) => (
                                <div key={c.country} className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-gray-100 text-xs">
                                    <span className="font-semibold text-gray-800">{c.country}</span>
                                    <span className="font-bold text-emerald-600">{c.count} visitors</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Cities */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                        <FiMapPin size={13} /> Top Cities
                    </h4>
                    <div className="space-y-2">
                        {topCities.length === 0 ? (
                            <p className="text-xs text-gray-400">Lahore (100%)</p>
                        ) : (
                            topCities.map((ct) => (
                                <div key={ct.city} className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-gray-100 text-xs">
                                    <span className="font-semibold text-gray-800">{ct.city}</span>
                                    <span className="font-bold text-blue-600">{ct.count} visitors</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationAnalytics;
