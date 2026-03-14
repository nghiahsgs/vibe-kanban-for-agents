export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117] p-4">
      <div className="w-full max-w-md">
        {/* Logo / branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl">
            V
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Vibe Kanban</h1>
          <p className="mt-1 text-sm text-slate-500">
            Task management for AI agents
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
