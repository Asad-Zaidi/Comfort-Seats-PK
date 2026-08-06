import { FiZap, FiCheckCircle } from "react-icons/fi";

const PerformanceAnalytics = () => {
    return (
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FiZap className="text-amber-500" size={18} />
                    Performance Analytics & Web Vitals
                </h3>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <FiCheckCircle size={12} /> Optimal Speed
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
                    <span className="block text-xs text-gray-500">Page Load Time</span>
                    <span className="text-lg font-bold text-gray-900 mt-1 block">340 ms</span>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
                    <span className="block text-xs text-gray-500">FCP (First Paint)</span>
                    <span className="text-lg font-bold text-emerald-600 mt-1 block">180 ms</span>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
                    <span className="block text-xs text-gray-500">LCP (Content Paint)</span>
                    <span className="text-lg font-bold text-blue-600 mt-1 block">420 ms</span>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
                    <span className="block text-xs text-gray-500">CLS (Layout Shift)</span>
                    <span className="text-lg font-bold text-purple-600 mt-1 block">0.01</span>
                </div>
            </div>
        </div>
    );
};

export default PerformanceAnalytics;
