'use client';

import React from 'react';

export type InvoiceItem = {
  id: string;
  item: string;
  price: number;
  date: string;
};

export default function InvoiceTable({
  title,
  data,
}: {
  title: string;
  data: InvoiceItem[];
}) {
  return (
    <section className="bg-white p-6 shadow rounded mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      {data.length === 0 ? (
        <p className="text-gray-600 italic">No items found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-yellow-100 text-left text-sm">
              <th className="py-2 px-3 border-b">Item</th>
              <th className="py-2 px-3 border-b">Price</th>
              <th className="py-2 px-3 border-b">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="text-sm hover:bg-gray-50">
                <td className="py-2 px-3 border-b">{item.item}</td>
                <td className="py-2 px-3 border-b">R{item.price.toLocaleString()}</td>
                <td className="py-2 px-3 border-b">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
