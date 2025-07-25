'use client';


import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

type Deposit = {
  auctionId: string;
  status: 'paid' | 'return_in_progress' | 'returned';
  returned: boolean;
};
type User = {
  email: string;
  name: string;
  username?: string;
  role?: 'admin' | 'user';
  suspended?: boolean;
  ficaApproved?: boolean;
  idDocument?: string;
  proofOfAddress?: string;
  deposits?: Deposit[];
};
type Auction = { id: string; title: string };


export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [depositActionLoading, setDepositActionLoading] = useState<string>('');

  useEffect(() => {
    fetchUsers();
    fetchAuctions();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
    const data = await res.json();
    setUsers(data);
  };
  const fetchAuctions = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions`);
    const data = await res.json();
    setAuctions(data);
  };

  const toggleSuspend = async (email: string, suspended?: boolean) => {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/suspend/${encodeURIComponent(email)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ suspended: !suspended }),
  });
  await fetchUsers();
    fetchUsers();
  };

  const approveFica = async (email: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/fica/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    fetchUsers();
  };

  // Admin marks deposit as returned or in progress
  const handleDepositStatus = async (email: string, auctionId: string, status: 'in_progress' | 'returned') => {
    setDepositActionLoading(email + auctionId + status);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deposits/return`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, auctionId, status }),
    });
    setDepositActionLoading('');
    fetchUsers();
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-yellow-600">User Management</h1>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-xs uppercase">
                <th className="p-2">Name</th>
                <th className="p-2">Username</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">FICA</th>
                <th className="p-2">Suspended</th>
                <th className="p-2">Deposit Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.email} className="border-t">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.username || '-'}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.role || 'user'}</td>
                  <td className="p-2">
                    {user.ficaApproved ? (
                      <span className="text-green-600 font-semibold">Approved</span>
                    ) : (user.idDocument || user.proofOfAddress) ? (
                      <>
                        {user.idDocument && (
                          <a
                            href={`/uploads/fica/${user.idDocument}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline mr-2"
                          >
                            ID
                          </a>
                        )}
                        {user.proofOfAddress && (
                          <a
                            href={`/uploads/fica/${user.proofOfAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline mr-2"
                          >
                            Proof
                          </a>
                        )}
                        <button
                          onClick={() => approveFica(user.email)}
                          className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                        >
                          Approve
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500">No File</span>
                    )}
                  </td>
                  <td className="p-2">{user.suspended ? 'Yes' : 'No'}</td>
                  {/* Deposit status per auction */}
                  <td className="p-2">
                    {auctions.length === 0 ? (
                      <span className="text-gray-400">No auctions</span>
                    ) : (
                      <div className="space-y-1">
                        {auctions.map(auction => {
                          const deposit = user.deposits?.find(d => d.auctionId === auction.id);
                          return (
                            <div key={auction.id} className="flex items-center gap-2">
                              <span className="font-semibold text-xs">{auction.title}:</span>
                              <span className="text-xs">
                                {deposit?.status === 'paid' && 'Paid'}
                                {deposit?.status === 'return_in_progress' && 'Return in Progress'}
                                {deposit?.status === 'returned' && 'Returned'}
                                {!deposit && 'Not Paid'}
                              </span>
                              {/* Admin actions */}
                              {deposit && deposit.status === 'paid' && (
                                <button
                                  className="px-2 py-1 text-xs bg-yellow-500 text-white rounded disabled:opacity-50"
                                  disabled={depositActionLoading === user.email + auction.id + 'in_progress'}
                                  onClick={() => handleDepositStatus(user.email, auction.id, 'in_progress')}
                                >
                                  Mark Return In Progress
                                </button>
                              )}
                              {deposit && deposit.status === 'return_in_progress' && (
                                <button
                                  className="px-2 py-1 text-xs bg-green-600 text-white rounded disabled:opacity-50"
                                  disabled={depositActionLoading === user.email + auction.id + 'returned'}
                                  onClick={() => handleDepositStatus(user.email, auction.id, 'returned')}
                                >
                                  Mark as Returned
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => toggleSuspend(user.email, user.suspended)}
                      className={`px-2 py-1 text-xs rounded ${
                        user.suspended
                          ? 'bg-blue-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {user.suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
