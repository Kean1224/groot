'use client';

import React, { useEffect, useState } from 'react';
// Backend status indicator
function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'fail'>('checking');
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ping`, {
      signal: controller.signal,
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        clearTimeout(timeoutId);
        if (response.ok) {
          setStatus('ok');
        } else {
          console.log('Backend response not ok:', response.status);
          setStatus('fail');
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.log('Backend ping failed:', error.message);
        setStatus('fail');
      });
  }, []);
  return (
    <div className="mb-2 text-xs">
      Backend status: {status === 'checking' ? 'Checking...' : status === 'ok' ? '🟢 Connected' : '🔴 Not reachable'}
    </div>
  );
}
import AdminSidebar from '../../../components/AdminSidebar';

type Deposit = {
  auctionId: string;
  status: 'paid' | 'pending' | 'return_in_progress' | 'returned';
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
    const data = await res.json();
    setUsers(data);
  };
  const fetchAuctions = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions`);
    const data = await res.json();
    setAuctions(data);
  };

  // Helper to get admin auth headers
  const getAdminHeaders = () => {
    const token = localStorage.getItem('admin_jwt');
    console.log('Admin token:', token ? 'Found' : 'Not found');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const toggleSuspend = async (email: string, suspended?: boolean) => {
    try {
      const token = localStorage.getItem('admin_jwt');
      console.log('JWT token from localStorage:', token ? 'present' : 'missing');
      console.log('Toggling suspend for:', email, 'current status:', suspended);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/suspend/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ suspended: !suspended }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to toggle suspend:', errorData);
        alert(`Failed to ${suspended ? 'unsuspend' : 'suspend'} user: ${errorData.error || 'Unknown error'}`);
        return;
      }
      
      const successData = await response.json();
      console.log('Suspend toggle successful:', successData);
      await fetchUsers();
    } catch (error) {
      console.error('Error toggling suspend:', error);
      alert('Network error occurred');
    }
  };

  const approveFica = async (email: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/fica/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
    });
    fetchUsers();
  };

  // Admin marks deposit as returned or in progress
  const handleDepositStatus = async (email: string, auctionId: string, status: 'in_progress' | 'returned') => {
    setDepositActionLoading(email + auctionId + status);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deposits/return`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ email, auctionId, status }),
    });
    setDepositActionLoading('');
    fetchUsers();
  };

  // Admin approves pending deposit
  const approveDeposit = async (email: string, auctionId: string) => {
    setDepositActionLoading(email + auctionId + 'approve');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deposits/${auctionId}/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ status: 'approved' }),
    });
    setDepositActionLoading('');
    fetchUsers();
  };

  // Delete user handler
  const deleteUser = async (email: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete user:', errorData);
        alert(`Failed to delete user: ${errorData.error || 'Unknown error'}`);
        return;
      }
      
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Network error occurred');
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 max-w-5xl mx-auto">
        <BackendStatus />
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
                <th className="p-2">Delete</th>
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
                            href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/fica/${user.idDocument}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline mr-2"
                          >
                            ID
                          </a>
                        )}
                        {user.proofOfAddress && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/fica/${user.proofOfAddress}`}
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
                                {deposit?.status === 'pending' && 'Pending Approval'}
                                {deposit?.status === 'return_in_progress' && 'Return in Progress'}
                                {deposit?.status === 'returned' && 'Returned'}
                                {!deposit && 'Not Paid'}
                              </span>
                              {/* Admin actions */}
                              {deposit && deposit.status === 'pending' && (
                                <button
                                  className="px-2 py-1 text-xs bg-green-500 text-white rounded disabled:opacity-50"
                                  disabled={depositActionLoading === user.email + auction.id + 'approve'}
                                  onClick={() => approveDeposit(user.email, auction.id)}
                                >
                                  Approve Deposit
                                </button>
                              )}
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
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!user.suspended}
                        onChange={() => toggleSuspend(user.email, user.suspended)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-400 rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
                      <span className="ml-2 text-xs font-medium text-gray-700">
                        {user.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </label>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => deleteUser(user.email)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
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
