import ProtectedRoute from '@/components/general/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main>
        <h1>Protected Dashboard</h1>
        <p>You are authenticated.</p>
      </main>
    </ProtectedRoute>
  );
}
