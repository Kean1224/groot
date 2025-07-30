"use client";

import { useEffect, useState } from "react";

interface RefundRequest {
  auctionId: string;
  email: string;
  status: string;
  requestedAt: string;
  updatedAt?: string;
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState<string>("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/refunds/`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setRefunds(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load refund requests.");
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (auctionId: string, email: string, status: string) => {
    setActionStatus("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/refunds/${auctionId}/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRefunds(refunds => refunds.map(r => r.auctionId === auctionId && r.email === email ? { ...r, status } : r));
        setActionStatus("✅ Updated");
      } else {
        setActionStatus("❌ Failed to update");
      }
    } catch {
      setActionStatus("❌ Failed to update");
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-yellow-700">Deposit Refund Requests</h1>
      {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
        <table className="w-full border text-sm bg-white rounded shadow">
          <thead>
            <tr className="bg-yellow-100">
              <th className="p-2">Auction ID</th>
              <th className="p-2">Buyer Email</th>
              <th className="p-2">Status</th>
              <th className="p-2">Requested At</th>
              <th className="p-2">Updated At</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((r, idx) => (
              <tr key={r.auctionId + r.email + idx} className="border-t">
                <td className="p-2">{r.auctionId}</td>
                <td className="p-2">{r.email}</td>
                <td className="p-2 font-bold">{r.status}</td>
                <td className="p-2">{new Date(r.requestedAt).toLocaleString()}</td>
                <td className="p-2">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-'}</td>
                <td className="p-2">
                  {r.status === 'pending' && (
                    <>
                      <button className="bg-green-600 text-white px-2 py-1 rounded mr-2 hover:bg-green-700" onClick={() => handleUpdate(r.auctionId, r.email, 'approved')}>Approve</button>
                      <button className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700" onClick={() => handleUpdate(r.auctionId, r.email, 'rejected')}>Reject</button>
                    </>
                  )}
                  {r.status !== 'pending' && <span className="text-gray-500">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {actionStatus && <p className="mt-4 text-blue-700">{actionStatus}</p>}
    </main>
  );
}
