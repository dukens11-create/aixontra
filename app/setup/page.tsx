'use client';

import { useState } from 'react';

export default function AdminSetupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create admin account');
        return;
      }

      setMessage('Admin account created successfully!');
      setSetupComplete(true);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            🔐 Admin Account Setup
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Create the first admin account for AIXONTRA
          </p>
        </div>

        {!setupComplete ? (
          <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '0.375rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#991b1b' }}>{error}</p>
              </div>
            )}

            {message && (
              <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '0.375rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#166534' }}>{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                backgroundColor: loading ? '#9ca3af' : '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#166534' }}>
                ✅ Admin account created successfully!
              </p>
            </div>
            <a
              href="/"
              style={{ color: '#4f46e5', textDecoration: 'none' }}
            >
              Go to home page →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}