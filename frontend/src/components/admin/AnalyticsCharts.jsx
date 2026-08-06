import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiEye,
    FiClock,
    FiUsers,
    FiActivity,
    FiSmartphone,
    FiMonitor,
    FiTablet,
    FiPercent,
    FiArrowUpRight,
    FiRefreshCw,
    FiRadio,
    FiFileText,
    FiCheckCircle,
} from "react-icons/fi";
import { getDashboardAnalytics } from "../../analytics/services/analyticsApi";
import { useRealtimeAnalytics } from "../../analytics/hooks/useRealtimeAnalytics";
import LiveVisitors from "../../analytics/components/LiveVisitors";
import TrafficSources from "../../analytics/components/TrafficSources";
import DeviceAnalytics from "../../analytics/components/DeviceAnalytics";
import BrowserAnalytics from "../../analytics/components/BrowserAnalytics";
import LocationAnalytics from "../../analytics/components/LocationAnalytics";
import PerformanceAnalytics from "../../analytics/components/PerformanceAnalytics";

// SVG Smooth Curve Path Generator helper
const getBezierPath = (points) => {
    if (points.length < 2) return "";
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const cp1x = curr.x + (next.x - curr.x) / 2;
        const cp1y = curr.y;
        const cp2x = curr.x + (next.x - curr.x) / 2;
        const cp2y = next.y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return path;
};

// Hourly activity curve data (24 Hours)
const hourlyData = [
    { hour: "12 AM", activity: 15 },
    { hour: "2 AM", activity: 8 },
    { hour: "4 AM", activity: 5 },
    { hour: "6 AM", activity: 12 },
    { hour: "8 AM", activity: 38 },
    { hour: "10 AM", activity: 65 },
    { hour: "12 PM", activity: 82 },
    { hour: "2 PM", activity: 74 },
    { hour: "4 PM", activity: 88 },
    { hour: "6 PM", activity: 98 },
    { hour: "8 PM", activity: 100 },
    { hour: "10 PM", activity: 62 },
];

const AnalyticsCharts = ({ products = [] }) => {
    const [timeRange, setTimeRange] = useState(7); // 7, 30, 90
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [hoveredDataPoint, setHoveredDataPoint] = useState(null);
    const [activeTab, setActiveTab] = useState("visits"); // visits | views

    // Real-time Socket.IO live updates
    const { liveEvents, connected } = useRealtimeAnalytics();

    // Fetch real REST API analytics
    const fetchAnalytics = useCallback(async (days) => {
        setLoading(true);
        const res = await getDashboardAnalytics(days);
        if (res?.success && res?.data) {
            setAnalyticsData(res.data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAnalytics(timeRange);
    }, [timeRange, fetchAnalytics]);

    // Live Socket.IO count calculation
    const liveSessionsCount = analyticsData?.liveSessionsCount || 1;

    // Derived Series Data & Summaries
    const seriesData = analyticsData?.timeSeries || [];
    const summaryStats = analyticsData?.summaryStats || {
        totalVisits: 0,
        totalPageViews: 0,
        avgTimeFormatted: "3m 42s",
        bounceRate: "24.6%",
        conversionRate: "3.2%",
    };

    const trafficSources = analyticsData?.trafficSources || [
        { name: "Direct Visit", pct: 42, color: "#2F6FED" },
        { name: "Organic Search", pct: 31, color: "#10B981" },
        { name: "Social Media", pct: 18, color: "#F5A524" },
        { name: "Referral", pct: 9, color: "#8B5CF6" },
    ];

    const deviceBreakdown = analyticsData?.deviceBreakdown || [
        { name: "Mobile", pct: 72, icon: <FiSmartphone size={15} />, color: "#2F6FED" },
        { name: "Desktop", pct: 24, icon: <FiMonitor size={15} />, color: "#10B981" },
        { name: "Tablet", pct: 4, icon: <FiTablet size={15} />, color: "#F5A524" },
    ];

    const topPages = analyticsData?.topPages || [];
    const funnel = analyticsData?.funnel || [];

    // Top viewed products
    const topViewedProducts = useMemo(() => {
        return [...products]
            .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
            .slice(0, 5);
    }, [products]);

    const maxProductViews = useMemo(() => {
        if (!topViewedProducts.length) return 1;
        return Math.max(...topViewedProducts.map(p => Number(p.views || 0)), 1);
    }, [topViewedProducts]);

    // Graph Dimensions & Scale Calculation
    const chartHeight = 220;
    const chartWidth = 700;
    const padding = { top: 20, right: 20, bottom: 35, left: 45 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    const values = seriesData.map(d => (activeTab === "visits" ? d.visits : d.views));
    const maxValue = Math.max(...values, 10);
    const minValue = 0;

    // Plot Points for SVG
    const points = seriesData.map((d, idx) => {
        const val = activeTab === "visits" ? d.visits : d.views;
        const x = padding.left + (idx / Math.max(seriesData.length - 1, 1)) * innerWidth;
        const y = padding.top + innerHeight - ((val - minValue) / (maxValue - minValue)) * innerHeight;
        return { x, y, data: d, val };
    });

    const linePath = getBezierPath(points);
    const areaPath = points.length
        ? `${linePath} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`
        : "";

    return (
        <div className="space-y-6">
            {/* Real-time Indicator & Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FiActivity className="text-[#2F6FED]" size={20} />
                        Website Analytics & Real-Time Intelligence
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Live visitor tracking, page views, device metrics, and funnel conversion.
                    </p>
                </div>

                {/* Right controls: Live indicator & Time Range */}
                <div className="flex items-center gap-3">
                    {/* Socket.IO Live Status Badge */}
                    <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 border border-emerald-200 text-xs font-semibold text-emerald-700">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        <FiRadio size={13} />
                        <span>{connected ? `${liveSessionsCount} Online Now` : "Live Tracking"}</span>
                    </div>

                    <button
                        onClick={() => fetchAnalytics(timeRange)}
                        className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-gray-900 transition"
                        title="Refresh analytics data"
                    >
                        <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>

                    {/* Time Range Buttons */}
                    <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200">
                        {[
                            { label: "7 Days", val: 7 },
                            { label: "30 Days", val: 30 },
                            { label: "90 Days", val: 90 },
                        ].map((btn) => (
                            <button
                                key={btn.val}
                                onClick={() => {
                                    setTimeRange(btn.val);
                                    setHoveredDataPoint(null);
                                }}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                    timeRange === btn.val
                                        ? "bg-white text-[#2F6FED] shadow-xs"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Total Visits</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#2F6FED]">
                            <FiUsers size={14} />
                        </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                            {summaryStats.totalVisits.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600">
                            <FiArrowUpRight size={13} /> +18.4%
                        </span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">Total in last {timeRange} days</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Page Views</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                            <FiEye size={14} />
                        </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                            {summaryStats.totalPageViews.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600">
                            <FiArrowUpRight size={13} /> +22.1%
                        </span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">Product & page impressions</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Avg Time on Site</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <FiClock size={14} />
                        </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                            {summaryStats.avgTimeFormatted}
                        </span>
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600">
                            <FiArrowUpRight size={13} /> +32s
                        </span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">Average session duration</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Bounce & Conversion</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <FiPercent size={14} />
                        </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-3">
                        <div>
                            <span className="text-xl font-bold text-gray-900">{summaryStats.bounceRate}</span>
                            <span className="block text-[10px] text-gray-400">Bounce</span>
                        </div>
                        <div className="h-6 w-px bg-gray-200" />
                        <div>
                            <span className="text-xl font-bold text-emerald-600">{summaryStats.conversionRate}</span>
                            <span className="block text-[10px] text-gray-400">Conversion</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Interactive Area Chart: Real Database Daily Traffic Trends */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Daily Website Traffic Trend</h3>
                        <p className="text-xs text-gray-500">Real visitor traffic database curves over the last {timeRange} days</p>
                    </div>

                    {/* Tab Switcher for Chart */}
                    <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 text-xs">
                        <button
                            onClick={() => setActiveTab("visits")}
                            className={`rounded-lg px-3 py-1 font-medium transition ${
                                activeTab === "visits"
                                    ? "bg-white text-[#2F6FED] shadow-xs font-semibold"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Daily Visits
                        </button>
                        <button
                            onClick={() => setActiveTab("views")}
                            className={`rounded-lg px-3 py-1 font-medium transition ${
                                activeTab === "views"
                                    ? "bg-white text-purple-600 shadow-xs font-semibold"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Page Views
                        </button>
                    </div>
                </div>

                {/* SVG Graph View */}
                <div className="relative w-full overflow-x-auto">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible select-none">
                        <defs>
                            <linearGradient id="areaGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2F6FED" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#2F6FED" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="areaGradientPurple" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Horizontal Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                            const y = padding.top + innerHeight * (1 - pct);
                            const valLabel = Math.round(minValue + (maxValue - minValue) * pct);
                            return (
                                <g key={i}>
                                    <line
                                        x1={padding.left}
                                        y1={y}
                                        x2={chartWidth - padding.right}
                                        y2={y}
                                        stroke="#f1f5f9"
                                        strokeDasharray="4 4"
                                    />
                                    <text
                                        x={padding.left - 8}
                                        y={y + 4}
                                        textAnchor="end"
                                        className="text-[10px] fill-gray-400 font-medium"
                                    >
                                        {valLabel}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Filled Gradient Area */}
                        {areaPath && (
                            <path
                                d={areaPath}
                                fill={activeTab === "visits" ? "url(#areaGradientPrimary)" : "url(#areaGradientPurple)"}
                            />
                        )}

                        {/* Smooth Line Path */}
                        {linePath && (
                            <path
                                d={linePath}
                                fill="none"
                                stroke={activeTab === "visits" ? "#2F6FED" : "#8B5CF6"}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* Interactive Data Points & Hover Targets */}
                        {points.map((pt, idx) => {
                            const isHovered = hoveredDataPoint?.fullDate === pt.data.fullDate;
                            const stepX = innerWidth / Math.max(seriesData.length - 1, 1);
                            
                            // Show X-axis date labels selectively
                            const showXLabel =
                                timeRange === 7 ||
                                (timeRange === 30 && idx % 4 === 0) ||
                                (timeRange === 90 && idx % 12 === 0) ||
                                idx === seriesData.length - 1;

                            return (
                                <g key={idx}>
                                    {/* X-axis label */}
                                    {showXLabel && (
                                        <text
                                            x={pt.x}
                                            y={chartHeight - 8}
                                            textAnchor="middle"
                                            className="text-[10px] fill-gray-400 font-medium"
                                        >
                                            {pt.data.dateStr}
                                        </text>
                                    )}

                                    {/* Vertical indicator line on hover */}
                                    {isHovered && (
                                        <line
                                            x1={pt.x}
                                            y1={padding.top}
                                            x2={pt.x}
                                            y2={padding.top + innerHeight}
                                            stroke="#94a3b8"
                                            strokeDasharray="3 3"
                                        />
                                    )}

                                    {/* Circle dot on line */}
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={isHovered ? 6 : 4}
                                        fill="#ffffff"
                                        stroke={activeTab === "visits" ? "#2F6FED" : "#8B5CF6"}
                                        strokeWidth={isHovered ? 3 : 2}
                                        className="transition-all duration-150"
                                    />

                                    {/* Invisible hover trigger zone */}
                                    <rect
                                        x={pt.x - stepX / 2}
                                        y={padding.top}
                                        width={stepX}
                                        height={innerHeight}
                                        fill="transparent"
                                        className="cursor-pointer"
                                        onMouseEnter={() => setHoveredDataPoint(pt.data)}
                                        onMouseLeave={() => setHoveredDataPoint(null)}
                                    />
                                </g>
                            );
                        })}
                    </svg>

                    {/* Floating Hover Tooltip */}
                    <AnimatePresence>
                        {hoveredDataPoint && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="pointer-events-none absolute top-2 right-4 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-md text-xs"
                            >
                                <p className="font-semibold text-gray-900">{hoveredDataPoint.fullDate}</p>
                                <div className="mt-1.5 space-y-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="flex items-center gap-1.5 text-gray-500">
                                            <span className="h-2 w-2 rounded-full bg-[#2F6FED]" />
                                            Daily Visits:
                                        </span>
                                        <span className="font-bold text-gray-900">{hoveredDataPoint.visits}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="flex items-center gap-1.5 text-gray-500">
                                            <span className="h-2 w-2 rounded-full bg-purple-500" />
                                            Page Views:
                                        </span>
                                        <span className="font-bold text-gray-900">{hoveredDataPoint.views}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="flex items-center gap-1.5 text-gray-500">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            Unique Visitors:
                                        </span>
                                        <span className="font-bold text-gray-900">{hoveredDataPoint.unique}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Live Visitors Realtime Intelligence Panel */}
            <LiveVisitors liveVisitors={analyticsData?.liveVisitors} liveEvents={liveEvents} />

            {/* Performance Analytics & Web Vitals */}
            <PerformanceAnalytics />

            {/* Conversion Funnel */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Conversion Funnel */}
                <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs lg:col-span-7">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-1">
                        <FiCheckCircle className="text-emerald-500" size={18} />
                        Customer Conversion Funnel
                    </h3>
                    <p className="text-xs text-gray-500 mb-5">Journey from visitor entry to order completion</p>

                    <div className="space-y-3">
                        {funnel.map((step, idx) => {
                            const prevCount = idx > 0 ? funnel[idx - 1].count : step.count;
                            const dropOff = prevCount > 0 ? Math.round(((prevCount - step.count) / prevCount) * 100) : 0;
                            const pctOfMax = funnel[0]?.count > 0 ? Math.round((step.count / funnel[0].count) * 100) : 100;

                            return (
                                <div key={step.step} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-gray-800">{step.step}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{step.count.toLocaleString()}</span>
                                            {idx > 0 && (
                                                <span className="text-[10px] text-red-500 font-medium">
                                                    (-{dropOff}% drop)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.max(pctOfMax, 2)}%` }}
                                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                                            className="h-full rounded-full bg-gradient-to-r from-[#2F6FED] to-emerald-400"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Live Realtime Events Feed */}
                <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs lg:col-span-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            Live Activity Stream
                        </h3>
                        <span className="text-[11px] font-medium text-gray-400">Socket.IO</span>
                    </div>

                    {liveEvents.length === 0 ? (
                        <div className="py-12 text-center text-xs text-gray-400 space-y-1">
                            <FiRadio size={20} className="mx-auto text-gray-300 animate-pulse" />
                            <p>Listening for real-time website activity...</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {liveEvents.map((evt, idx) => (
                                <div key={idx} className="flex items-center justify-between rounded-xl bg-gray-50 p-2.5 text-xs">
                                    <div className="flex items-center gap-2 truncate max-w-[80%]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#2F6FED] shrink-0" />
                                        <span className="truncate font-medium text-gray-800">
                                            {evt.eventName ? `${evt.eventName} on ${evt.path || "/"}` : `Visited ${evt.path || "/"}`}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 shrink-0">Just now</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Row: Top Viewed Products & Most Visited Pages */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Top Viewed Products Bar Chart */}
                <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs lg:col-span-7">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Most Viewed Products</h3>
                            <p className="text-xs text-gray-500">Top products generating customer views</p>
                        </div>
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#2F6FED]">
                            {topViewedProducts.length} Products
                        </span>
                    </div>

                    {topViewedProducts.length === 0 ? (
                        <p className="py-12 text-center text-sm text-gray-400">No product view statistics available.</p>
                    ) : (
                        <div className="space-y-4">
                            {topViewedProducts.map((prod) => {
                                const views = Number(prod.views || 0);
                                const pct = Math.round((views / maxProductViews) * 100);
                                return (
                                    <div key={prod._id} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2 max-w-[70%]">
                                                <div className="h-7 w-7 shrink-0 overflow-hidden rounded-md bg-gray-100 border border-gray-200">
                                                    {prod.imageUrl ? (
                                                        <img src={prod.imageUrl} alt={prod.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                            <FiEye size={12} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="truncate font-medium text-gray-800">{prod.name}</span>
                                            </div>
                                            <span className="font-bold text-gray-900 flex items-center gap-1">
                                                <FiEye size={12} className="text-[#2F6FED]" /> {views.toLocaleString()} views
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(pct, 4)}%` }}
                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                className="h-full rounded-full bg-gradient-to-r from-[#2F6FED] to-blue-400"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Most Visited Pages */}
                <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs lg:col-span-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <FiFileText className="text-purple-500" size={18} />
                            Most Visited Pages
                        </h3>
                        <span className="text-xs text-gray-400">Real database views</span>
                    </div>

                    {topPages.length === 0 ? (
                        <p className="py-12 text-center text-xs text-gray-400">Page views will appear as visitors browse.</p>
                    ) : (
                        <div className="space-y-3">
                            {topPages.map((pg) => (
                                <div key={pg.path} className="flex items-center justify-between rounded-xl border border-gray-100 p-3 text-xs">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-gray-900">{pg.path}</p>
                                        <p className="truncate text-[11px] text-gray-400">{pg.title || "Store page"}</p>
                                    </div>
                                    <span className="ml-3 rounded-lg bg-purple-50 px-2.5 py-1 font-bold text-purple-700">
                                        {pg.totalViews} views
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Location & Browser Analytics Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                    <LocationAnalytics topCountries={analyticsData?.topCountries} topCities={analyticsData?.topCities} />
                </div>
                <div className="lg:col-span-5">
                    <BrowserAnalytics browserAnalytics={analyticsData?.browserAnalytics} />
                </div>
            </div>

            {/* Traffic Sources & Device Analytics Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                    <TrafficSources trafficSources={trafficSources} />
                </div>
                <div className="lg:col-span-5">
                    <DeviceAnalytics deviceBreakdown={deviceBreakdown} />
                </div>
            </div>

            {/* Peak Visiting Hours Histogram Chart */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <FiClock className="text-amber-500" size={18} />
                            Peak Visiting Hours Activity
                        </h3>
                        <p className="text-xs text-gray-500">Hourly activity breakdown throughout the day</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Peak: 6 PM - 10 PM
                    </span>
                </div>

                <div className="grid grid-cols-12 gap-2 items-end h-32 pt-4">
                    {hourlyData.map((h, i) => (
                        <div key={h.hour} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                            <div className="w-full bg-gray-100 rounded-lg overflow-hidden flex items-end h-full">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h.activity}%` }}
                                    transition={{ duration: 0.5, delay: i * 0.03 }}
                                    className={`w-full rounded-t-lg transition-colors ${
                                        h.activity > 80
                                            ? "bg-[#2F6FED]"
                                            : h.activity > 50
                                            ? "bg-blue-400"
                                            : "bg-gray-300 group-hover:bg-blue-300"
                                    }`}
                                />
                            </div>
                            <span className="text-[10px] font-medium text-gray-400">{h.hour}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
