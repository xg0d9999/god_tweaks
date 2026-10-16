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

function isNewerSemver(remote: string, current: string): boolean {
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
  let currentVersion = "1.12.2";

  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    try {
      const { getVersion } = await import("@tauri-apps/api/app");
      try {
        currentVersion = await getVersion();
      } catch {}

      // 1. Primary check: Native Tauri v2 Updater (via latest.json + Minisign)
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const update = await check();

        if (update && update.available) {
          return {
            available: true,
            currentVersion: update.currentVersion || currentVersion,
            version: update.version,
            date: update.date,
            body: update.body,
            updateObj: update,
          };
        }
      } catch (tauriErr) {
        console.warn("Tauri native updater check skipped or pending manifest:", tauriErr);
      }

      // 2. Direct GitHub Releases API Check (guarantees update detection as soon as a release is published)
      try {
        const res = await fetch("https://api.github.com/repos/xg0d9999/god_tweaks/releases/latest", {
          headers: { Accept: "application/vnd.github+json" },
        });

        if (res.ok) {
          const rel = await res.json();
          const remoteTag = (rel.tag_name || "").replace(/^v/, "").trim();

          if (remoteTag && isNewerSemver(remoteTag, currentVersion)) {
            const exeAsset = rel.assets?.find(
              (a: { name?: string }) => a.name?.endsWith(".exe") || a.name?.endsWith(".msi")
            );
            return {
              available: true,
              currentVersion,
              version: remoteTag,
              date: rel.published_at,
              body: rel.body || "Nueva versión oficial disponible en GitHub.",
              downloadUrl: exeAsset?.browser_download_url || rel.html_url,
            };
          }
        }
      } catch (ghErr) {
        console.warn("GitHub release fallback check error:", ghErr);
      }

      return {
        available: false,
        currentVersion,
      };
    } catch (err) {
      console.warn("Overall update check failed:", err);
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
  onProgress?: DownloadProgressCallback,
  downloadUrl?: string
): Promise<void> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    if (updateObj) {
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
    } else if (downloadUrl) {
      // Fallback: Open release download URL via shell
      const { open } = await import("@tauri-apps/plugin-shell");
      await open(downloadUrl);
    }
  }
}
