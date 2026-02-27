'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const PASSCODE = 'admin123';
const ADMIN_STORAGE_KEY = 'campusflow_admin_ok';

export default function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passcode !== PASSCODE) {
      setError('Invalid passcode for this demo.');
      return;
    }

    localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    router.push('/admin/dashboard');
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <section className="card">
        <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use passcode <span className="font-medium">admin123</span> for this local demo.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="passcode" className="mb-1 block text-sm font-medium text-slate-700">
              Admin Passcode
            </label>
            <input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(event) => {
                setPasscode(event.target.value);
                setError('');
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-200 focus:ring"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Continue to Dashboard
          </button>
        </form>
      </section>
    </div>
  );
}
