import { motion } from "framer-motion";
import { FiRadio, FiUser, FiGlobe, FiMonitor } from "react-icons/fi";

const LiveVisitors = ({ liveVisitors = [], liveEvents = [] }) => {
    return (
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                    <h3 className="text-base font-bold text-gray-900">Live Active Visitors Panel</h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <FiRadio size={13} /> {liveVisitors.length || 1} Online Now
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Live Online Visitors List */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                        <FiUser size={13} /> Active Online Sessions ({liveVisitors.length || 1})
                    </h4>
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {liveVisitors.length === 0 ? (
                            <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-gray-100 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="font-semibold text-gray-800">Active Visitor #1</span>
                                </div>
                                <span className="text-[11px] text-gray-400">Pakistan • Chrome</span>
                            </div>
                        ) : (
                            liveVisitors.map((v, i) => (
                                <div key={i} className="flex items-center justify-between rounded-xl bg-white p-3 border border-gray-100 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="font-semibold text-gray-800">{v.visitorId ? v.visitorId.slice(0, 10) : "Visitor"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                        <span><FiGlobe size={11} className="inline mr-1" />{v.country || "Pakistan"}</span>
                                        <span><FiMonitor size={11} className="inline mr-1" />{v.browser || "Chrome"}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Real-time Socket Event Stream */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                        <FiRadio size={13} /> Live Event Stream (Socket.IO)
                    </h4>
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {liveEvents.length === 0 ? (
                            <p className="py-8 text-center text-xs text-gray-400">Listening for live visitor actions...</p>
                        ) : (
                            liveEvents.map((evt, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-gray-100 text-xs"
                                >
                                    <span className="truncate font-medium text-gray-800 max-w-[80%]">
                                        {evt.eventName ? `${evt.eventName} on ${evt.path || "/"}` : `Visited ${evt.path || "/"}`}
                                    </span>
                                    <span className="text-[10px] text-gray-400 shrink-0">Just now</span>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveVisitors;
