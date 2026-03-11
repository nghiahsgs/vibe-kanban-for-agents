import { ApiKeyManager } from "@/components/settings/api-key-manager";

export default function SettingsPage() {
  return (
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">API Keys</h1>
      <p className="text-muted-foreground mb-8">Manage keys for programmatic access by AI agents</p>
      <ApiKeyManager />
    </div>
  );
}
