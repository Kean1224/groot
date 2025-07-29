
"use client";
import React from 'react';
import LoginForm from '../../components/loginform';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 via-white to-blue-200 py-10 px-2">
      <LoginForm />
    </main>
  );
}
