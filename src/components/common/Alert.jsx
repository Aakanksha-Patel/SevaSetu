// =======================================================
// Alert Component
// =======================================================

import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

export default function Alert({ type = 'info', message, title, className = '' }) {
  if (!message) return null;

  const types = {
    success: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    error: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: XCircle,
      iconColor: 'text-rose-600',
    },
    warning: {
      bg: 'bg-orange-50 text-orange-800 border-orange-200',
      icon: AlertCircle,
      iconColor: 'text-orange-600',
    },
    info: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600',
    },
  };

  const current = types[type] || types.info;
  const Icon = current.icon;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${current.bg} ${className}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      <div>
        {title && <h4 className="font-semibold">{title}</h4>}
        <p>{message}</p>
      </div>
    </div>
  );
}
