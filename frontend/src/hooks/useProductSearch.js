import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const DEFAULT_LIVE_LIMIT = 10;

export const useProductSearch = ({ liveLimit = DEFAULT_LIVE_LIMIT } = {}) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const trimmedQuery = useMemo(() => String(query || "").trim(), [query]);
    const shouldSearch = useMemo(() => trimmedQuery.length >= 2, [trimmedQuery]);

    const search = useCallback(
        async (term) => {
            const next = String(term || "").trim();

            if (!next || next.length < 2) {
                setResults([]);
                setLoading(false);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const { data } = await api.get("/products/search", {
                    params: {
                        q: next,
                        limit: liveLimit,
                    },
                });

                const items = Array.isArray(data?.data) ? data.data : [];
                setResults(items);
            } catch (err) {
                console.error("Product search failed:", err);
                setError(err?.response?.data?.message || "Search failed. Please try again.");
                setResults([]);
            } finally {
                setLoading(false);
            }
        },
        [liveLimit]
    );

    const goToProduct = useCallback(
        (product) => {
            if (!product) return;
            const slug = product.slug || "";
            const url = slug ? `/products/${slug}` : "/products";
            navigate(url);
        },
        [navigate]
    );

    const goToAllResults = useCallback(() => {
        const q = trimmedQuery;
        if (!q) return;
        navigate(`/products?search=${encodeURIComponent(q)}`);
    }, [navigate, trimmedQuery]);

    return {
        query,
        setQuery,
        trimmedQuery,
        results,
        loading,
        error,
        shouldSearch,
        search,
        goToProduct,
        goToAllResults,
        clear: () => {
            setQuery("");
            setResults([]);
            setError(null);
            setLoading(false);
        },
    };
};

export default useProductSearch;