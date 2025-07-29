'use client';

export default function EnvDebug() {
  return (
    <div className="p-4 bg-gray-100 m-4 rounded">
      <h2 className="text-xl font-bold mb-4">Environment Variables Debug</h2>
      <div className="space-y-2">
        <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'undefined'}</p>
        <p><strong>NEXT_PUBLIC_BACKEND_URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL || 'undefined'}</p>
        <p><strong>NEXT_PUBLIC_WS_URL:</strong> {process.env.NEXT_PUBLIC_WS_URL || 'undefined'}</p>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'undefined'}</p>
      </div>
    </div>
  );
}
