'use client';


import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

type Offer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  itemTitle: string;
  itemDescription: string;
  submittedAt: string;
  responded: boolean;
  adminResponse?: string;
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [responseText, setResponseText] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sell-item`);
    const data = await res.json();
    setOffers(data);
  };

  const handleRespond = async (id: string) => {
    const res = await fetch(`/api/sell-item/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: responseText[id] })
    });

    if (res.ok) {
      setResponseText(prev => ({ ...prev, [id]: '' }));
      fetchOffers();
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-8 py-8 bg-white">
        <main className="p-6 max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-yellow-600">Client Offers to Sell Items</h1>

          {offers.length === 0 ? (
            <p>No offers submitted.</p>
          ) : (
            <ul className="space-y-6">
              {offers.map(offer => (
                <li key={offer.id} className="bg-white p-5 rounded shadow border">
                  <div className="mb-3">
                    <p className="text-xl font-bold text-yellow-700">{offer.itemTitle}</p>
                    <p className="text-gray-600">{offer.itemDescription}</p>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Submitted by:</strong> {offer.name} ({offer.email}, {offer.phone})</p>
                    <p><strong>Date:</strong> {new Date(offer.submittedAt).toLocaleString()}</p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          offer.responded ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {offer.responded ? 'Responded' : 'Pending'}
                      </span>
                    </p>
                  </div>

                  {!offer.responded && (
                    <div className="mt-4 space-y-2">
                      <textarea
                        placeholder="Type your response here..."
                        value={responseText[offer.id] || ''}
                        onChange={e =>
                          setResponseText({ ...responseText, [offer.id]: e.target.value })
                        }
                        className="w-full border px-4 py-2 rounded"
                      />
                      <button
                        onClick={() => handleRespond(offer.id)}
                        disabled={!responseText[offer.id]?.trim()}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
                      >
                        ✅ Send Response
                      </button>
                    </div>
                  )}

                  {offer.responded && offer.adminResponse && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                      <strong>Admin Response:</strong> {offer.adminResponse}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </main>
      </main>
    </div>
  );
}

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sell-item`);
    const data = await res.json();
    setOffers(data);
  };

  const handleRespond = async (id: string) => {
    const res = await fetch(`/api/sell-item/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: responseText[id] })
    });

    if (res.ok) {
      setResponseText(prev => ({ ...prev, [id]: '' }));
      fetchOffers();
    }
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-yellow-600">Client Offers to Sell Items</h1>

      {offers.length === 0 ? (
        <p>No offers submitted.</p>
      ) : (
        <ul className="space-y-6">
          {offers.map(offer => (
            <li key={offer.id} className="bg-white p-5 rounded shadow border">
              <div className="mb-3">
                <p className="text-xl font-bold text-yellow-700">{offer.itemTitle}</p>
                <p className="text-gray-600">{offer.itemDescription}</p>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Submitted by:</strong> {offer.name} ({offer.email}, {offer.phone})</p>
                <p><strong>Date:</strong> {new Date(offer.submittedAt).toLocaleString()}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      offer.responded ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {offer.responded ? 'Responded' : 'Pending'}
                  </span>
                </p>
              </div>

              {!offer.responded && (
                <div className="mt-4 space-y-2">
                  <textarea
                    placeholder="Type your response here..."
                    value={responseText[offer.id] || ''}
                    onChange={e =>
                      setResponseText({ ...responseText, [offer.id]: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded"
                  />
                  <button
                    onClick={() => handleRespond(offer.id)}
                    disabled={!responseText[offer.id]?.trim()}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
                  >
                    ✅ Send Response
                  </button>
                </div>
              )}

              {offer.responded && offer.adminResponse && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                  <strong>Admin Response:</strong> {offer.adminResponse}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
