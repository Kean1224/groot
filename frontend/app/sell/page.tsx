'use client';

import React, { useState } from 'react';

type SellItem = {
  title: string;
  description: string;
  images: File[];
};

export default function SellPage() {
  const [items, setItems] = useState<SellItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [message, setMessage] = useState('');

  const handleAddItem = () => {
    if (!title || !description || images.length === 0) {
      setMessage('❌ Please complete all fields and add images.');
      return;
    }

    const newItem: SellItem = { title, description, images };
    setItems([...items, newItem]);
    setTitle('');
    setDescription('');
    setImages([]);
    setMessage('✅ Item added successfully!');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files).slice(0, 3);
      setImages(fileList);
    }
  };

  return (
    <main className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold text-yellow-600 mb-6 text-center">Sell Your Items</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">Item Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border rounded px-4 py-2 shadow-sm"
            placeholder="e.g. Honda Lawnmower"
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border rounded px-4 py-2 shadow-sm"
            rows={4}
            placeholder="e.g. Excellent condition, starts first pull..."
          />
        </div>

        <div>
          <label className="block font-medium">Upload Images (max 3)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="mt-2"
          />
          {images.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">{images.length} image(s) selected</p>
          )}
        </div>

        <button
          onClick={handleAddItem}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded shadow"
        >
          Upload Item
        </button>

        {message && <p className="text-center mt-4 text-green-700">{message}</p>}
      </div>

      {/* Optional: Preview uploaded items below */}
      {items.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Uploaded Items</h2>
          {items.map((item, index) => (
            <div key={index} className="border p-4 mb-4 rounded shadow-sm">
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="text-gray-700 mb-2">{item.description}</p>
              <div className="flex gap-2">
                {item.images.map((file, i) => (
                  <p key={i} className="text-xs text-gray-500">
                    {file.name}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
