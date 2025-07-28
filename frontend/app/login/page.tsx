'use client';

import React, { useState } from 'react';
import { setToken } from '../../utils/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
import LoginForm from '../../components/loginform';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 via-white to-blue-200 py-10 px-2">
      <LoginForm />
    </main>
  );
}
        headers: { 'Content-Type': 'application/json' },
