// =======================================================
// Loading Spinner Component
// =======================================================

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading SevaSetu...', size = 'md' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500">
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-emerald-600 mb-2`} />
      {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
    </div>
  );
}
