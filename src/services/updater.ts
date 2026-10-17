export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  version?: string;
  date?: string;
  body?: string;
  downloadUrl?: string;
  updateObj?: unknown;
}

export type DownloadProgressCallback = (downloaded: number, total: number | null) => void;

export function isNewerSemver(remote: string, current: string): boolean {
  const cleanRemote = remote.trim().replace(/^v/, "").split("-")[0];
  const cleanCurrent = current.trim().replace(/^v/, "").split("-")[0];

  const r = cleanRemote.split(".").map((n) => parseInt(n, 10) || 0);
  const c = cleanCurrent.split(".").map((n) => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(r.length, c.length); i++) {
    const rNum = r[i] || 0;
    const cNum = c[i] || 0;
    if (rNum > cNum) return true;
    if (rNum < cNum) return false;
  }
  return false;
}

// Safe wrapper to check for updates in both Tauri desktop runtime and browser preview
export async function checkForAppUpdate(): Promise<UpdateInfo> {
  let currentVersion = "1.12.6";

  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    try {
      const { getVersion } = await import("@tauri-apps/api/app");
      try {
        currentVersion = await getVersion();
      } catch {}

      // Native Tauri v2 Updater (via latest.json + Minisign)
      // Using cache-busting headers to prevent Fastly/GitHub CDN from returning stale manifests
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check({
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
        timeout: 15000,
      });

      if (update) {
        return {
          available: true,
          currentVersion: update.currentVersion || currentVersion,
          version: update.version,
          date: update.date,
          body: update.body || "Nueva actualización oficial disponible.",
          updateObj: update,
        };
      }

      return {
        available: false,
        currentVersion,
      };
    } catch (err) {
      console.warn("Tauri updater check error:", err);
      return {
        available: false,
        currentVersion,
      };
    }
  } else {
    // Development preview fallback simulation
    return {
      available: false,
      currentVersion,
    };
  }
}

// Download and install update seamlessly (silent in-place replacement and automatic relaunch)
export async function installAppUpdate(
  updateObj: unknown,
  onProgress?: DownloadProgressCallback
): Promise<void> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    if (!updateObj) {
      throw new Error("No hay un paquete de actualización nativo disponible.");
    }

    const update = updateObj as {
      downloadAndInstall: (
        callback?: (event: { event: string; data?: { chunkLength?: number; contentLength?: number } }) => void
      ) => Promise<void>;
    };

    let downloaded = 0;
    let total: number | null = null;

    // Download and execute the installer silently/passively behind the scenes
    await update.downloadAndInstall((event) => {
      if (event.event === "Started") {
        total = event.data?.contentLength || null;
        if (onProgress) onProgress(0, total);
      } else if (event.event === "Progress") {
        downloaded += event.data?.chunkLength || 0;
        if (onProgress) onProgress(downloaded, total);
      } else if (event.event === "Finished") {
        if (onProgress) onProgress(downloaded, downloaded);
      }
    });

    // On Windows, the installer runs in passive mode, replaces files and restarts the app.
    // We attempt relaunch as fallback if process is still active.
    try {
      const { relaunch } = await import("@tauri-apps/plugin-process");
      await relaunch();
    } catch {
      // If installer already closed the process for replacement, this is normal
    }
  }
}
