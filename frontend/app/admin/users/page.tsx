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
  const [auctionRegistrations, setAuctionRegistrations] = useState<any[]>([]);
  const [depositActionLoading, setDepositActionLoading] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'users' | 'registrations'>('users');

  useEffect(() => {
    fetchUsers();
    fetchAuctions();
    fetchAuctionRegistrations();
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

  const fetchAuctionRegistrations = async () => {
    try {
      const token = localStorage.getItem('admin_jwt');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions/registrations`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAuctionRegistrations(data);
        console.log('Fetched auction registrations:', data.length);
      }
    } catch (error) {
      console.error('Error fetching auction registrations:', error);
    }
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
      <main className="flex-1 p-6 max-w-7xl mx-auto">
        <BackendStatus />
        <h1 className="text-3xl font-bold mb-6 text-yellow-600">User Management</h1>
        
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Registered Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'registrations'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Auction Registrations ({auctionRegistrations.length})
            </button>
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Full User Accounts</h2>
            <p className="text-gray-600 mb-4">Users who have created complete accounts with email verification.</p>
            {users.length === 0 ? (
              <p>No registered users found.</p>
            ) : (
              <div className="overflow-x-auto">
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
              </div>
            )}
          </div>
        )}

        {/* Auction Registrations Tab */}
        {activeTab === 'registrations' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">🚨 Auction Registrations & Verification Status</h2>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Security Alert</h3>
              <p className="text-yellow-700 text-sm">
                This shows ALL people who have registered for auctions. Those with incomplete verification 
                <strong> cannot bid</strong> but are still registered. Red entries indicate security gaps.
              </p>
            </div>
            {auctionRegistrations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No auction registrations found.</p>
                <p className="text-sm text-gray-400 mt-2">
                  This shows people who clicked "Register Here" on auction pages.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead>
                    <tr className="bg-blue-100 text-left text-xs uppercase">
                      <th className="p-2">Email</th>
                      <th className="p-2">Auction</th>
                      <th className="p-2">Full Account</th>
                      <th className="p-2">FICA Status</th>
                      <th className="p-2">Deposit Status</th>
                      <th className="p-2">Can Participate</th>
                      <th className="p-2">Security Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auctionRegistrations.map((reg, index) => {
                      const isSecurityRisk = !reg.canParticipate && !reg.hasFullAccount;
                      return (
                        <tr key={`${reg.email}-${reg.auctionId}-${index}`} 
                            className={`border-t ${isSecurityRisk ? 'bg-red-50' : ''}`}>
                          <td className="p-2 font-medium">{reg.email}</td>
                          <td className="p-2">{reg.auctionTitle}</td>
                          <td className="p-2">
                            {reg.hasFullAccount ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ✗ No
                              </span>
                            )}
                          </td>
                          <td className="p-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              reg.ficaStatus === 'approved' ? 'bg-green-100 text-green-800' :
                              reg.ficaStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              reg.ficaStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {reg.ficaStatus === 'approved' ? '✓ Approved' :
                               reg.ficaStatus === 'pending' ? '⏳ Pending' :
                               reg.ficaStatus === 'rejected' ? '✗ Rejected' :
                               '⚪ Not Uploaded'}
                            </span>
                          </td>
                          <td className="p-2">
                            {reg.depositRequired ? (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                reg.depositStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                reg.depositStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {reg.depositStatus === 'approved' ? '✓ Paid' :
                                 reg.depositStatus === 'pending' ? '⏳ Pending' :
                                 `✗ Not Paid (R${reg.depositAmount})`}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Not Required
                              </span>
                            )}
                          </td>
                          <td className="p-2">
                            {reg.canParticipate ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Can Bid
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ✗ Cannot Bid
                              </span>
                            )}
                          </td>
                          <td className="p-2">
                            {isSecurityRisk ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                🚨 HIGH
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ OK
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Total Registrations</h4>
                    <p className="text-2xl font-bold text-blue-600">{auctionRegistrations.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800">Can Participate</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {auctionRegistrations.filter(reg => reg.canParticipate).length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800">Security Risks</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {auctionRegistrations.filter(reg => !reg.canParticipate && !reg.hasFullAccount).length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800">No Full Account</h4>
                    <p className="text-2xl font-bold text-yellow-600">
                      {auctionRegistrations.filter(reg => !reg.hasFullAccount).length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
