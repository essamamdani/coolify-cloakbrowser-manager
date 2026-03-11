import { useCallback, useEffect, useState } from "react";
import { api, type Profile, type ProfileCreateData } from "../lib/api";

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.listProfiles();
      setProfiles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profiles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Poll for status changes every 3 seconds
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const create = useCallback(
    async (data: ProfileCreateData) => {
      const profile = await api.createProfile(data);
      setProfiles((prev) => [profile, ...prev]);
      return profile;
    },
    [],
  );

  const update = useCallback(
    async (id: string, data: Partial<ProfileCreateData>) => {
      const profile = await api.updateProfile(id, data);
      setProfiles((prev) => prev.map((p) => (p.id === id ? profile : p)));
      return profile;
    },
    [],
  );

  const remove = useCallback(
    async (id: string) => {
      await api.deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    },
    [],
  );

  const launch = useCallback(
    async (id: string) => {
      const result = await api.launchProfile(id);
      await refresh();
      return result;
    },
    [refresh],
  );

  const stop = useCallback(
    async (id: string) => {
      await api.stopProfile(id);
      await refresh();
    },
    [refresh],
  );

  return { profiles, loading, error, refresh, create, update, remove, launch, stop };
}
