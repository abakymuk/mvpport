import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/dashboard/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="py-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
