import { Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Profile, ProfileCreateData } from "../lib/api";

interface ProfileFormProps {
  profile: Profile | null; // null = create mode
  onSave: (data: ProfileCreateData) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}

const GPU_PRESETS: Record<string, { vendor: string; renderer: string }> = {
  "NVIDIA RTX 3070": {
    vendor: "Google Inc. (NVIDIA)",
    renderer: "ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 (0x00002484) Direct3D11 vs_5_0 ps_5_0, D3D11)",
  },
  "NVIDIA RTX 4070": {
    vendor: "Google Inc. (NVIDIA)",
    renderer: "ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 (0x00002786) Direct3D11 vs_5_0 ps_5_0, D3D11)",
  },
  "AMD RX 6800 XT": {
    vendor: "Google Inc. (AMD)",
    renderer: "ANGLE (AMD, AMD Radeon RX 6800 XT (0x000073BF) Direct3D11 vs_5_0 ps_5_0, D3D11)",
  },
  "Intel UHD 770": {
    vendor: "Google Inc. (Intel)",
    renderer: "ANGLE (Intel, Intel(R) UHD Graphics 770 (0x00004680) Direct3D11 vs_5_0 ps_5_0, D3D11)",
  },
  "Apple M3 (macOS)": {
    vendor: "Google Inc. (Apple)",
    renderer: "ANGLE (Apple, ANGLE Metal Renderer: Apple M3, Unspecified Version)",
  },
};

export function ProfileForm({ profile, onSave, onDelete, onCancel }: ProfileFormProps) {
  const isEdit = profile !== null;

  const [form, setForm] = useState<ProfileCreateData>({
    name: "",
    platform: "windows",
    screen_width: 1920,
    screen_height: 1080,
    humanize: false,
    human_preset: "default",
    headless: false,
    geoip: false,
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        fingerprint_seed: profile.fingerprint_seed,
        proxy: profile.proxy,
        timezone: profile.timezone,
        locale: profile.locale,
        platform: profile.platform,
        user_agent: profile.user_agent,
        screen_width: profile.screen_width,
        screen_height: profile.screen_height,
        gpu_vendor: profile.gpu_vendor,
        gpu_renderer: profile.gpu_renderer,
        hardware_concurrency: profile.hardware_concurrency,
        humanize: profile.humanize,
        human_preset: profile.human_preset,
        headless: profile.headless,
        geoip: profile.geoip,
        color_scheme: profile.color_scheme,
        notes: profile.notes,
      });
    }
  }, [profile]);

  const set = <K extends keyof ProfileCreateData>(key: K, value: ProfileCreateData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm("Delete this profile? Browser data will be permanently removed.")) return;
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const applyGpuPreset = (name: string) => {
    const preset = GPU_PRESETS[name];
    if (preset) {
      set("gpu_vendor", preset.vendor);
      set("gpu_renderer", preset.renderer);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Profile" : "New Profile"}
          </h2>
          {isEdit && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{deleting ? "Deleting..." : "Delete"}</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1.5">
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? "Saving..." : isEdit ? "Save" : "Create"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Basic */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Basic</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Profile Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Amazon Seller #1"
                required
              />
            </div>
            <div>
              <label className="label">Platform</label>
              <select
                className="input"
                value={form.platform}
                onChange={(e) => set("platform", e.target.value)}
              >
                <option value="windows">Windows</option>
                <option value="macos">macOS</option>
                <option value="linux">Linux</option>
              </select>
            </div>
            <div>
              <label className="label">Fingerprint Seed</label>
              <input
                className="input"
                type="number"
                value={form.fingerprint_seed ?? ""}
                onChange={(e) => set("fingerprint_seed", e.target.value ? Number(e.target.value) : null)}
                placeholder="Auto (random)"
              />
            </div>
          </div>
        </section>

        {/* Network */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Network</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Proxy</label>
              <input
                className="input"
                value={form.proxy ?? ""}
                onChange={(e) => set("proxy", e.target.value || null)}
                placeholder="http://user:pass@host:port"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Timezone</label>
                <input
                  className="input"
                  value={form.timezone ?? ""}
                  onChange={(e) => set("timezone", e.target.value || null)}
                  placeholder="America/New_York"
                />
              </div>
              <div>
                <label className="label">Locale</label>
                <input
                  className="input"
                  value={form.locale ?? ""}
                  onChange={(e) => set("locale", e.target.value || null)}
                  placeholder="en-US"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.geoip ?? false}
                onChange={(e) => set("geoip", e.target.checked)}
                className="rounded border-border bg-surface-2"
              />
              Auto-detect timezone/locale from proxy IP (GeoIP)
            </label>
          </div>
        </section>

        {/* Hardware */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Hardware</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Screen Width</label>
                <input
                  className="input"
                  type="number"
                  value={form.screen_width ?? 1920}
                  onChange={(e) => set("screen_width", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="label">Screen Height</label>
                <input
                  className="input"
                  type="number"
                  value={form.screen_height ?? 1080}
                  onChange={(e) => set("screen_height", Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="label">Hardware Concurrency</label>
              <input
                className="input"
                type="number"
                value={form.hardware_concurrency ?? ""}
                onChange={(e) => set("hardware_concurrency", e.target.value ? Number(e.target.value) : null)}
                placeholder="Auto (from seed)"
              />
            </div>
            <div>
              <label className="label">GPU Preset</label>
              <select
                className="input"
                value=""
                onChange={(e) => {
                  if (e.target.value) applyGpuPreset(e.target.value);
                }}
              >
                <option value="">Select preset...</option>
                {Object.keys(GPU_PRESETS).map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">GPU Vendor</label>
              <input
                className="input"
                value={form.gpu_vendor ?? ""}
                onChange={(e) => set("gpu_vendor", e.target.value || null)}
                placeholder="Auto (from seed)"
              />
            </div>
            <div>
              <label className="label">GPU Renderer</label>
              <input
                className="input"
                value={form.gpu_renderer ?? ""}
                onChange={(e) => set("gpu_renderer", e.target.value || null)}
                placeholder="Auto (from seed)"
              />
            </div>
          </div>
        </section>

        {/* Behavior */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Behavior</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.humanize ?? false}
                onChange={(e) => set("humanize", e.target.checked)}
                className="rounded border-border bg-surface-2"
              />
              Human-like mouse, keyboard, and scroll behavior
            </label>
            {form.humanize && (
              <div>
                <label className="label">Human Preset</label>
                <select
                  className="input"
                  value={form.human_preset}
                  onChange={(e) => set("human_preset", e.target.value)}
                >
                  <option value="default">Default (normal speed)</option>
                  <option value="careful">Careful (slower, deliberate)</option>
                </select>
              </div>
            )}
            <div>
              <label className="label">Color Scheme</label>
              <select
                className="input"
                value={form.color_scheme ?? ""}
                onChange={(e) => set("color_scheme", e.target.value || null)}
              >
                <option value="">System default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="no-preference">No preference</option>
              </select>
            </div>
            <div>
              <label className="label">User Agent</label>
              <input
                className="input"
                value={form.user_agent ?? ""}
                onChange={(e) => set("user_agent", e.target.value || null)}
                placeholder="Auto (from binary)"
              />
            </div>
          </div>
        </section>

        {/* Notes */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Notes</h3>
          <textarea
            className="input min-h-[80px] resize-y"
            value={form.notes ?? ""}
            onChange={(e) => set("notes", e.target.value || null)}
            placeholder="Optional notes about this profile..."
          />
        </section>
      </div>

    </form>
  );
}
