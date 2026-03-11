import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

interface ProfileViewerProps {
  profileId: string;
  onDisconnect: () => void;
}

export function ProfileViewer({ profileId, onDisconnect }: ProfileViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rfbRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let rfb: any = null;
    let cancelled = false;

    async function connect() {
      try {
        // Import noVNC dynamically
        const { default: RFB } = await import("@novnc/novnc/core/rfb.js");

        if (cancelled) return;

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/api/profiles/${profileId}/vnc`;

        rfb = new RFB(containerRef.current!, wsUrl, {
          wsProtocols: ["binary"],
        });
        rfbRef.current = rfb;

        rfb.scaleViewport = true;
        rfb.resizeSession = false;
        rfb.showDotCursor = true;

        rfb.addEventListener("connect", () => {
          if (!cancelled) setConnected(true);
        });

        rfb.addEventListener("disconnect", () => {
          if (!cancelled) {
            setConnected(false);
            onDisconnect();
          }
        });

        rfb.addEventListener("securityfailure", (e: any) => {
          setError(`Security failure: ${e.detail.reason}`);
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to connect");
        }
      }
    }

    connect();

    return () => {
      cancelled = true;
      if (rfb) {
        try {
          rfb.disconnect();
        } catch {
          // ignore
        }
      }
      rfbRef.current = null;
    };
  }, [profileId, onDisconnect]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-2">Connection failed</p>
          <p className="text-gray-500 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-1 border-b border-border">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-yellow-400 animate-pulse"}`} />
          <span className="text-xs text-gray-400">
            {connected ? "Connected" : "Connecting..."}
          </span>
        </div>
        <button
          onClick={toggleFullscreen}
          className="text-gray-500 hover:text-gray-300 p-1"
          title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* VNC canvas container */}
      <div
        ref={containerRef}
        className="flex-1 bg-black overflow-hidden"
        style={{ minHeight: 0 }}
      />
    </div>
  );
}
