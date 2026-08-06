import { FiSmartphone, FiMonitor, FiTablet } from "react-icons/fi";

const DeviceAnalytics = ({ deviceBreakdown = [] }) => {
    return (
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Device Analytics</h3>
            <p className="text-xs text-gray-500 mb-4">Real device type distribution</p>

            <div className="grid grid-cols-3 gap-3">
                {deviceBreakdown.map((dev) => (
                    <div key={dev.name} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-center">
                        <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-xs text-gray-700">
                            {dev.name === "Mobile" ? <FiSmartphone size={16} /> : dev.name === "Desktop" ? <FiMonitor size={16} /> : <FiTablet size={16} />}
                        </span>
                        <span className="mt-2 block text-lg font-bold text-gray-900">{dev.pct}%</span>
                        <span className="block text-xs text-gray-500">{dev.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeviceAnalytics;
