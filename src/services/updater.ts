export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  version?: string;
  date?: string;
  body?: string;
  updateObj?: unknown;
}

export type DownloadProgressCallback = (downloaded: number, total: number | null) => void;

// Safe wrapper to check for updates in both Tauri desktop runtime and browser preview
export async function checkForAppUpdate(): Promise<UpdateInfo> {
  const currentVersion = "1.0.0";

  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();

      if (update && update.available) {
        return {
          available: true,
          currentVersion,
          version: update.version,
          date: update.date,
          body: update.body,
          updateObj: update,
        };
      } else {
        return {
          available: false,
          currentVersion,
        };
      }
    } catch (err) {
      console.warn("Update check failed or no network:", err);
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

// Download and install update seamlessly
export async function installAppUpdate(
  updateObj: unknown,
  onProgress?: DownloadProgressCallback
): Promise<void> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window && updateObj) {
    const update = updateObj as {
      downloadAndInstall: (
        callback?: (event: { event: string; data?: { chunkLength?: number; contentLength?: number } }) => void
      ) => Promise<void>;
    };

    let downloaded = 0;
    let total: number | null = null;

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

    // Relaunch the app automatically with the new version
    const { relaunch } = await import("@tauri-apps/plugin-process");
    await relaunch();
  }
}
