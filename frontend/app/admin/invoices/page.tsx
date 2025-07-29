'use client';


import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

type Invoice = {
  id: string;
  auctionTitle: string;
  lotNumber: number;
  item: string;
  baseAmount: number;
  amount: number;
  sellerNet: number;
  buyerEmail: string;
  sellerEmail: string;
  date: string;
  paid?: boolean;
};
function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState('');
  const [filtered, setFiltered] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice|null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`);
      const data = await res.json();
      // For demo, add paid:false if missing
      const withPaid = data.map((inv: Invoice) => ({ ...inv, paid: inv.paid ?? false }));
      setInvoices(withPaid);
      setFiltered(withPaid);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    }
  };

  const handleFilter = () => {
    const term = filter.trim().toLowerCase();
    if (!term) return setFiltered(invoices);

    const result = invoices.filter(
      inv =>
        inv.buyerEmail.toLowerCase().includes(term) ||
        inv.sellerEmail.toLowerCase().includes(term)
    );
    setFiltered(result);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-8 py-8 bg-white">
        <div className="p-6 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-600 mb-6">Invoice Overview</h1>

          {/* Filter */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by buyer or seller email..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border px-4 py-2 w-full rounded"
            />
            <button
              onClick={handleFilter}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Filter
            </button>
          </div>

          {/* Invoice Table */}
          <div className="overflow-auto bg-white p-4 rounded shadow">
            <table className="w-full text-sm text-left border">
              <thead>
                <tr className="bg-gray-100 text-xs uppercase text-gray-600">
                  <th className="p-2">Auction</th>
                  <th className="p-2">Lot</th>
                  <th className="p-2">Item</th>
                  <th className="p-2">Buyer Total</th>
                  <th className="p-2">Buyer</th>
                  <th className="p-2">Seller</th>
                  <th className="p-2">Paid</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4 text-gray-500">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(inv => (
                    <tr key={inv.id} className="border-b">
                      <td className="p-2">{inv.auctionTitle}</td>
                      <td className="p-2">{inv.lotNumber}</td>
                      <td className="p-2">{inv.item}</td>
                      <td className="p-2 font-bold text-green-700">R{inv.amount.toFixed(2)}</td>
                      <td className="p-2">{inv.buyerEmail}</td>
                      <td className="p-2">{inv.sellerEmail}</td>
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={!!inv.paid}
                          onChange={async () => {
                            if (!inv.paid) {
                              // Mark as paid in backend
                              try {
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${inv.id}/paid`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                });
                                if (!res.ok) throw new Error('Failed to update');
                                setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, paid: true } : i));
                                setFiltered(prev => prev.map(i => i.id === inv.id ? { ...i, paid: true } : i));
                              } catch (err) {
                                alert('Failed to mark as paid.');
                              }
                            }
                          }}
                        />
                        <span className={inv.paid ? 'text-green-700 ml-2' : 'text-red-500 ml-2'}>
                          {inv.paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="p-2">
                        <button
                          className="text-blue-600 underline text-xs"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Invoice Detail Modal */}
          {selectedInvoice && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                  onClick={() => setSelectedInvoice(null)}
                >
                  &times;
                </button>
                <h2 className="text-2xl font-bold mb-4 text-yellow-700">Invoice Details</h2>
                <div className="space-y-2 text-sm">
                  <div><b>Auction:</b> {selectedInvoice.auctionTitle}</div>
                  <div><b>Lot:</b> {selectedInvoice.lotNumber}</div>
                  <div><b>Item:</b> {selectedInvoice.item}</div>
                  <div><b>Buyer:</b> {selectedInvoice.buyerEmail}</div>
                  <div><b>Seller:</b> {selectedInvoice.sellerEmail}</div>
                  <div><b>Date:</b> {new Date(selectedInvoice.date).toLocaleString()}</div>
                  <div><b>Base Amount:</b> R{selectedInvoice.baseAmount.toFixed(2)}</div>
                  <div><b>Buyer Total:</b> <span className="text-green-700 font-bold">R{selectedInvoice.amount.toFixed(2)}</span></div>
                  <div><b>Seller Net:</b> <span className="text-blue-700 font-bold">R{selectedInvoice.sellerNet.toFixed(2)}</span></div>
                  <div><b>Status:</b> {selectedInvoice.paid ? <span className="text-green-700">Paid</span> : <span className="text-red-500">Unpaid</span>}</div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    className={`px-4 py-2 rounded font-semibold ${selectedInvoice.paid ? 'bg-gray-400 text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    disabled={selectedInvoice.paid}
                    onClick={async () => {
                      if (!selectedInvoice.paid) {
                        try {
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${selectedInvoice.id}/paid`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                          });
                          if (!res.ok) throw new Error('Failed to update');
                          setInvoices(prev => prev.map(i => i.id === selectedInvoice.id ? { ...i, paid: true } : i));
                          setFiltered(prev => prev.map(i => i.id === selectedInvoice.id ? { ...i, paid: true } : i));
                          setSelectedInvoice(inv => inv ? { ...inv, paid: true } : inv);
                        } catch (err) {
                          alert('Failed to mark as paid.');
                        }
                      }
                    }}
                  >
                    Mark as Paid
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setSelectedInvoice(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminInvoicesPage;
