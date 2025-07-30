import { useEffect, useState } from 'react';

export default function AdminContactInbox() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/inbox`)
      .then(res => res.json())
      .then(data => setMessages(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full px-6 py-6 bg-white/80 rounded-xl mb-8">
      <h2 className="text-lg font-bold text-blue-700 mb-4">Contact Inbox</h2>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="text-gray-400 italic">No messages found.</div>
      ) : (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Message</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Reply</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg, i) => (
              <tr key={i} className="border-b">
                <td className="p-2 border">{msg.name}</td>
                <td className="p-2 border">{msg.email}</td>
                <td className="p-2 border">{msg.message}</td>
                <td className="p-2 border">{msg.date ? new Date(msg.date).toLocaleString() : '-'}</td>
                <td className="p-2 border">
                  <a
                    href={`mailto:${msg.email}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >Reply</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
