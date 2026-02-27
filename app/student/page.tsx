'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const STUDENT_ID_PATTERN = /^S\d{4}$/;
const STORAGE_KEY = 'campusflow_student_id';

export default function StudentLoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedId = studentId.toUpperCase().trim();

    if (!STUDENT_ID_PATTERN.test(normalizedId)) {
      setError('Enter a valid ID in format S#### (example: S1001).');
      return;
    }

    localStorage.setItem(STORAGE_KEY, normalizedId);
    router.push('/student/home');
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <section className="card">
        <h1 className="text-2xl font-bold text-slate-900">Student Portal Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your Student ID to access your local planning workspace.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="student-id" className="mb-1 block text-sm font-medium text-slate-700">
              Student ID
            </label>
            <input
              id="student-id"
              value={studentId}
              onChange={(event) => {
                setStudentId(event.target.value);
                setError('');
              }}
              placeholder="S1001"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-200 focus:ring"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Continue
          </button>
        </form>
      </section>
    </div>
  );
}
