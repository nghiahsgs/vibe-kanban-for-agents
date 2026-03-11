export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-muted/60 p-4">
      <div className="w-full max-w-md">
        {/* Logo / branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-md shadow-primary/25">
            V
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Vibe Kanban</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Task management for AI agents
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
