import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import SearchDropdown from "./SearchDropdown";

const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const isInitialMount = useRef(true);
  const navigate = useNavigate();
  const debouncedQuery = useDebouncedValue(query, 300);

  const displayedResults = useMemo(() => {
    if (!Array.isArray(results)) return [];
    return results.slice(0, 10);
  }, [results]);

  const executeSearch = useCallback(
    async (searchTerm) => {
      const trimmed = String(searchTerm || "").trim();

      if (!trimmed) {
        setResults([]);
        setIsSearching(false);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);
      setActiveIndex(-1);

      try {
        const { data } = await api.get("/products/search", {
          params: {
            q: trimmed,
            limit: 30,
          },
        });

        const items = Array.isArray(data?.data) ? data.data : [];
        setResults(items);
      } catch (err) {
        console.error("Search failed:", err);
        setError("Something went wrong while searching.");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    executeSearch(debouncedQuery);
  }, [debouncedQuery, executeSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const selectProduct = (product) => {
    if (!product) return;
    const slug = product.slug || "";
    const url = slug ? `/products/${slug}` : "/products";
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
    navigate(url);
  };

  const viewAllResults = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (event) => {
    const hasResults = displayedResults.length > 0;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!hasResults) return;
      setActiveIndex((prev) => (prev < displayedResults.length - 1 ? prev + 1 : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!hasResults) return;
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : displayedResults.length - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (hasResults && activeIndex >= 0 && activeIndex < displayedResults.length) {
        selectProduct(displayedResults[activeIndex]);
      } else if (hasResults) {
        selectProduct(displayedResults[0]);
      } else {
        viewAllResults();
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const showDropdown = isOpen && (query.trim().length >= 1 || isSearching);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-3 rounded-2xl border text-gray-800 bg-white/70 px-4 py-4 shadow-lg backdrop-blur transition focus-within:border-blue-500">
        <FiSearch className="shrink-0 text-gray-600" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search for chairs, sofas, tables..."
          onChange={(e) => {
            const next = e.target.value;
            const trimmed = next.trim();

            if (!next) {
              setResults([]);
              setError(null);
              setIsOpen(false);
              setActiveIndex(-1);
            } else if (trimmed.length >= 1) {
              setIsOpen(true);
            }

            setQuery(next);

            if (!trimmed) {
              setIsOpen(false);
            }
          }}
          // onFocus
          onFocus={() => {
            const trimmed = query.trim();
            if (trimmed && trimmed.length >= 1) {   // was >= 2
              setIsOpen(true);
            }
          }}
          autoComplete="off"
          className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-600 outline-none"
        />
        {isSearching && (
          <span className="h-2 w-2 shrink-0 animate-ping rounded-full bg-blue-500" />
        )}

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            className="rounded-full p-1 transition hover:bg-gray-100"
          >
            <FiX size={14} />
          </button>
        )}
      </div>

      <SearchDropdown
        open={showDropdown}
        products={displayedResults}
        activeIndex={activeIndex}
        onSelect={selectProduct}
        onViewAll={viewAllResults}
        totalResults={Array.isArray(results) ? results.length : 0}
        query={query}
        isSearching={isSearching}
        error={error}
        onClearError={() => setError(null)}
      />
    </div>
  );
};

export default SearchBar;