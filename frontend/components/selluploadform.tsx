'use client';

import React, { useState } from 'react';

type Item = {
  title: string;
  description: string;
  images: File[];
};

export default function SellUploadForm() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selected = Array.from(files).slice(0, 3); // Max 3 images
      setImages(selected);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || images.length === 0) {
      alert('Please fill in all fields and upload up to 3 images.');
      return;
    }

    const newItem: Item = { title, description, images };
    setItems([...items, newItem]);

    // Simulate upload success
    setSuccessMessage('✅ Item uploaded successfully (admin will review)');
    setTitle('');
    setDescription('');
    setImages([]);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold text-yellow-600 mb-4">Sell Your Item</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Item Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Upload up to 3 images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="mt-1"
          />
        </div>

        <button
          type="submit"
          className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
        >
          Upload
        </button>
      </form>

      {successMessage && (
        <p className="mt-4 text-green-600 font-semibold">{successMessage}</p>
      )}
    </div>
  );
}
