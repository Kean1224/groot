'use client';

import React from 'react';

export default function SniperProtectionNote() {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 mt-6 rounded">
      <p className="font-semibold mb-1">⚠️ Sniper Protection Enabled</p>
      <p className="text-sm">
        Any bid placed within the last <strong>4 minutes</strong> of an auction will extend the auction time by an
        additional <strong>4 minutes</strong> to ensure fair bidding.
      </p>
    </div>
  );
}
