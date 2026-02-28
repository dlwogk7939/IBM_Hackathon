'use client';

import dynamic from 'next/dynamic';
import { DashboardProvider, useDashboard } from './_lib/context';
import { Navbar } from './_components/shared/Navbar';
import { CardSkeleton } from './_components/shared/SkeletonLoader';

const StudentDashboard = dynamic(
  () => import('./_components/student/StudentDashboard').then((m) => m.default),
  { loading: () => <CardSkeleton /> },
);
const EducatorDashboard = dynamic(
  () => import('./_components/educator/EducatorDashboard').then((m) => m.default),
  { loading: () => <CardSkeleton /> },
);

function DashboardContent() {
  const { role } = useDashboard();
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {role === 'student' ? <StudentDashboard /> : <EducatorDashboard />}
      </main>
    </>
  );
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
