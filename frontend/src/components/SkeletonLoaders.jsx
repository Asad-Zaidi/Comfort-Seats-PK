import React from "react";

// Theme-adaptive skeleton color constant
const skelStyle = { backgroundColor: 'color-mix(in srgb, var(--text) 12%, transparent)' };
const skelLighter = { backgroundColor: 'color-mix(in srgb, var(--text) 8%, transparent)' };

export const SkeletonBanner = () => (
  <div className="relative h-[600px] w-full md:h-[700px] lg:h-[800px] overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
    <div className="absolute inset-0 animate-pulse" style={skelStyle} />
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/50 to-transparent" />
    <div className="relative mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-5 lg:px-8">
      <div className="text-center space-y-6 w-full max-w-3xl">
        <div className="inline-block h-8 w-48 rounded-full bg-white/20 animate-pulse" />
        <div className="space-y-3">
          <div className="h-10 w-3/4 mx-auto rounded bg-white/20 animate-pulse" />
          <div className="h-10 w-2/3 mx-auto rounded bg-white/20 animate-pulse" />
        </div>
        <div className="h-12 w-full max-w-2xl mx-auto rounded-2xl bg-white/20 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full mx-auto rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-5/6 mx-auto rounded bg-white/10 animate-pulse" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="h-12 w-32 rounded-xl bg-white/20 animate-pulse" />
          <div className="h-12 w-32 rounded-xl border border-white/30 bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonCategoryItem = () => (
  <div className="flex flex-col items-center gap-2 p-2 animate-pulse">
    <div className="h-16 w-16 rounded-full sm:h-20 sm:w-20" style={skelStyle} />
    <div className="h-3 w-16 rounded" style={skelStyle} />
  </div>
);

export const SkeletonProductCard = () => (
  <div className="flex flex-col h-full rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
    <div className="aspect-square animate-pulse" style={skelStyle} />
    <div className="flex flex-col flex-1 p-5 space-y-3">
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded animate-pulse" style={skelStyle} />
        <div className="h-8 w-1/3 rounded animate-pulse" style={skelStyle} />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded animate-pulse" style={skelLighter} />
        <div className="h-3 w-2/3 rounded animate-pulse" style={skelLighter} />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-4 rounded animate-pulse" style={skelStyle} />
          ))}
        </div>
        <div className="h-4 w-8 rounded animate-pulse" style={skelStyle} />
      </div>
      <div className="mt-auto pt-6">
        <div className="h-12 w-full rounded-xl animate-pulse" style={skelStyle} />
      </div>
    </div>
  </div>
);

export const SkeletonTestimonial = () => (
  <div className="flex h-48 flex-col rounded-3xl border p-8 space-y-4 transition-colors duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
    <div className="h-4 w-28 rounded animate-pulse" style={skelStyle} />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-full rounded animate-pulse" style={skelStyle} />
      <div className="h-3 w-5/6 rounded animate-pulse" style={skelStyle} />
    </div>
    <div className="border-t pt-2 space-y-2" style={{ borderColor: 'var(--border)' }}>
      <div className="h-4 w-32 rounded animate-pulse" style={skelStyle} />
      <div className="h-3 w-40 rounded animate-pulse" style={skelStyle} />
    </div>
  </div>
);

export const SkeletonValueCard = () => (
  <div className="rounded-2xl border p-6 text-center space-y-4 transition-colors duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
    <div className="mx-auto h-12 w-12 rounded-full animate-pulse" style={skelStyle} />
    <div className="h-5 w-3/4 mx-auto rounded animate-pulse" style={skelStyle} />
    <div className="space-y-2">
      <div className="h-3 w-full rounded animate-pulse" style={skelStyle} />
      <div className="h-3 w-2/3 mx-auto rounded animate-pulse" style={skelStyle} />
    </div>
  </div>
);

export const SkeletonFooter = () => (
  <footer style={{ backgroundColor: 'var(--footer-bg, #0F1320)', color: 'var(--footer-text, #9ca3af)' }}>
    <div className="mx-auto max-w-full px-8 py-12 lg:px-14">
      <div className="grid grid-cols-2 gap-y-10 gap-x-6 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-32 rounded bg-white/10 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-4/5 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-3/5 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </footer>
);

export const SkeletonProductDetail = () => (
  <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8" style={{ color: 'var(--text)' }}>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
      {/* Left: Image Gallery Skeleton */}
      <div className="lg:col-span-5 space-y-4">
        <div className="aspect-square rounded-3xl animate-pulse border" style={{ ...skelStyle, borderColor: 'var(--border)' }} />
        <div className="flex gap-2.5 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 w-16 shrink-0 rounded-xl animate-pulse border" style={{ ...skelStyle, borderColor: 'var(--border)' }} />
          ))}
        </div>
      </div>

      {/* Right: Product Info Skeleton */}
      <div className="lg:col-span-7 space-y-5">
        {/* Category Badge */}
        <div className="h-6 w-24 rounded-full animate-pulse" style={skelStyle} />

        {/* Title */}
        <div className="h-8 w-3/4 rounded animate-pulse" style={skelStyle} />

        {/* Rating */}
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-4 rounded animate-pulse" style={skelStyle} />
            ))}
          </div>
          <div className="h-4 w-16 rounded animate-pulse" style={skelStyle} />
          <div className="h-4 w-24 rounded animate-pulse" style={skelStyle} />
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-4">
          <div className="h-10 w-32 rounded animate-pulse" style={skelStyle} />
          <div className="h-6 w-24 rounded animate-pulse" style={skelStyle} />
          <div className="h-6 w-20 rounded-full animate-pulse" style={skelStyle} />
        </div>

        {/* Shipping badges */}
        <div className="flex flex-wrap gap-2">
          <div className="h-9 w-36 rounded-lg animate-pulse" style={skelStyle} />
          <div className="h-9 w-48 rounded-lg animate-pulse" style={skelStyle} />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded animate-pulse" style={skelStyle} />
          <div className="h-4 w-5/6 rounded animate-pulse" style={skelStyle} />
          <div className="h-4 w-4/6 rounded animate-pulse" style={skelStyle} />
        </div>

        {/* Color Options */}
        <div className="space-y-3">
          <div className="h-5 w-16 rounded animate-pulse" style={skelStyle} />
          <div className="flex flex-wrap gap-2.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-24 rounded-xl border animate-pulse" style={{ ...skelStyle, borderColor: 'var(--border)' }} />
            ))}
          </div>
        </div>

        {/* Stand Type Options */}
        <div className="space-y-3">
          <div className="h-5 w-24 rounded animate-pulse" style={skelStyle} />
          <div className="flex flex-wrap gap-2.5">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-10 w-28 rounded-xl border animate-pulse" style={{ ...skelStyle, borderColor: 'var(--border)' }} />
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <div className="h-5 w-8 rounded animate-pulse" style={skelStyle} />
          <div className="flex items-center overflow-hidden rounded-xl border" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border)' }}>
            <div className="h-11 w-11 animate-pulse" style={skelStyle} />
            <div className="w-14 text-center">
              <div className="h-5 w-8 mx-auto rounded animate-pulse" style={skelStyle} />
            </div>
            <div className="h-11 w-11 animate-pulse" style={skelStyle} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="h-12 flex-1 rounded-xl animate-pulse" style={skelStyle} />
          <div className="h-12 w-12 rounded-xl border animate-pulse" style={{ ...skelStyle, borderColor: 'var(--border)' }} />
        </div>

        {/* Product Details Checklist */}
        <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <div className="h-4 w-32 rounded animate-pulse" style={skelStyle} />
          <div className="space-y-2">
            <div className="h-4 w-40 rounded animate-pulse" style={skelStyle} />
            <div className="h-4 w-48 rounded animate-pulse" style={skelStyle} />
            <div className="h-4 w-36 rounded animate-pulse" style={skelStyle} />
          </div>
        </div>
      </div>
    </div>

    {/* Tabs Skeleton */}
    <div className="mt-16 space-y-6">
      <div className="flex gap-6 border-b" style={{ borderColor: 'var(--border)' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-5 w-24 rounded animate-pulse" style={skelStyle} />
        ))}
      </div>
      <div className="rounded-3xl p-6 border space-y-3" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="h-6 w-48 rounded animate-pulse" style={skelStyle} />
        <div className="h-4 w-full rounded animate-pulse" style={skelStyle} />
        <div className="h-4 w-5/6 rounded animate-pulse" style={skelStyle} />
        <div className="h-4 w-4/6 rounded animate-pulse" style={skelStyle} />
      </div>
    </div>

    {/* Related Products Skeleton */}
    <div className="mt-16 border-t pt-16" style={{ borderColor: 'var(--border)' }}>
      <div className="h-8 w-48 rounded animate-pulse mb-8" style={skelStyle} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col h-full rounded-2xl border shadow-xs overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <div className="aspect-square animate-pulse" style={skelStyle} />
            <div className="flex flex-col flex-1 p-5 space-y-3">
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded animate-pulse" style={skelStyle} />
                <div className="h-8 w-1/3 rounded animate-pulse" style={skelStyle} />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded animate-pulse" style={skelLighter} />
                <div className="h-3 w-2/3 rounded animate-pulse" style={skelLighter} />
              </div>
              <div className="mt-auto pt-6">
                <div className="h-12 w-full rounded-xl animate-pulse" style={skelStyle} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
