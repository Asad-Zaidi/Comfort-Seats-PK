import { useState } from "react";
import { motion } from "framer-motion";

const LazyImage = ({
  src,
  alt,
  className = "",
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder / skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Actual image */}
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className={`w-full h-full object-cover ${isLoaded ? "opacity-100" : "opacity-0"}`}
        {...props}
      />
    </div>
  );
};

export default LazyImage;