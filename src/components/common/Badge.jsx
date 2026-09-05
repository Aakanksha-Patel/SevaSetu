// =======================================================
// Reusable Badge Component
// =======================================================

import React from 'react';

export default function Badge({ children, variant = 'neutral', size = 'md' }) {
  const variantStyles = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const chosenVariant = variantStyles[variant] || variantStyles.neutral;
  const chosenSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap ${chosenVariant} ${chosenSize}`}
    >
      {children}
    </span>
  );
}
