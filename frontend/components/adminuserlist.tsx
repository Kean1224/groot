'use client';

import React from 'react';

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  ficaUploaded: boolean;
  suspended: boolean;
};

export default function AdminUserList({
  users,
  onToggleSuspend,
}: {
  users: AdminUser[];
  onToggleSuspend: (id: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-yellow-100">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">FICA</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">
                {user.ficaUploaded ? (
                  <span className="text-green-600">Uploaded</span>
                ) : (
                  <span className="text-red-500">Missing</span>
                )}
              </td>
              <td className="px-4 py-2">
                {user.suspended ? (
                  <span className="text-red-600">Suspended</span>
                ) : (
                  <span className="text-green-600">Active</span>
                )}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => onToggleSuspend(user.id)}
                  className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  {user.suspended ? 'Unsuspend' : 'Suspend'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
