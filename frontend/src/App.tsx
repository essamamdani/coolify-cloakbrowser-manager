import { useState, useCallback } from "react";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { useProfiles } from "./hooks/useProfiles";
import type { ProfileCreateData } from "./lib/api";
import { ProfileList } from "./components/ProfileList";
import { ProfileForm } from "./components/ProfileForm";
import { ProfileViewer } from "./components/ProfileViewer";
import { LaunchButton } from "./components/LaunchButton";
import { StatusIndicator } from "./components/StatusIndicator";

type View = "empty" | "create" | "edit" | "view";

export default function App() {
  const { profiles, loading, create, update, remove, launch, stop } = useProfiles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>("empty");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const selected = profiles.find((p) => p.id === selectedId) ?? null;

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    const profile = profiles.find((p) => p.id === id);
    setView(profile?.status === "running" ? "view" : "edit");
  }, [profiles]);

  const handleNew = useCallback(() => {
    setSelectedId(null);
    setView("create");
  }, []);

  const handleCreate = useCallback(async (data: ProfileCreateData) => {
    const profile = await create(data);
    setSelectedId(profile.id);
    setView("edit");
  }, [create]);

  const handleUpdate = useCallback(async (data: ProfileCreateData) => {
    if (!selectedId) return;
    await update(selectedId, data);
  }, [selectedId, update]);

  const handleDelete = useCallback(async () => {
    if (!selectedId) return;
    await remove(selectedId);
    setSelectedId(null);
    setView("empty");
  }, [selectedId, remove]);

  const handleLaunch = useCallback(async () => {
    if (!selectedId) return;
    await launch(selectedId);
    setView("view");
  }, [selectedId, launch]);

  const handleStop = useCallback(async () => {
    if (!selectedId) return;
    await stop(selectedId);
    setView("edit");
  }, [selectedId, stop]);

  const handleVncDisconnect = useCallback(() => {
    setView("edit");
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 border-r border-border bg-surface-1 flex-shrink-0">
          <ProfileList
            profiles={profiles}
            selectedId={selectedId}
            onSelect={handleSelect}
            onNew={handleNew}
          />
        </div>
      )}

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-300 p-1"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </button>
            {selected && (
              <div className="flex items-center gap-2">
                <StatusIndicator status={selected.status} size="md" />
                <span className="text-sm font-medium">{selected.name}</span>
                <span className="text-xs text-gray-500 capitalize">{selected.platform}</span>
              </div>
            )}
          </div>
          {selected && (
            <LaunchButton
              status={selected.status}
              onLaunch={handleLaunch}
              onStop={handleStop}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {view === "empty" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 text-sm">Select a profile or create a new one</p>
              </div>
            </div>
          )}

          {view === "create" && (
            <ProfileForm
              profile={null}
              onSave={handleCreate}
              onCancel={() => setView("empty")}
            />
          )}

          {view === "edit" && selected && (
            <ProfileForm
              profile={selected}
              onSave={handleUpdate}
              onDelete={handleDelete}
              onCancel={() => {
                setSelectedId(null);
                setView("empty");
              }}
            />
          )}

          {view === "view" && selected && selected.status === "running" && (
            <ProfileViewer
              profileId={selected.id}
              onDisconnect={handleVncDisconnect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
