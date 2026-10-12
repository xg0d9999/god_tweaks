/**
 * Anti-DevTools & Anti-Tamper Security Subsystem
 * Bloquea de forma estricta cualquier intento de abrir las herramientas de desarrollador,
 * inspeccionar elementos, ver código fuente o depurar la aplicación.
 */

export function initAntiDevtools(): void {
  if (typeof window === 'undefined') return;

  // 1. Bloquear clic derecho (menú contextual del navegador / webview)
  const blockContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  window.addEventListener('contextmenu', blockContextMenu, { capture: true });
  document.addEventListener('contextmenu', blockContextMenu, { capture: true });

  // 2. Bloquear combinaciones de teclas de DevTools y atajos del navegador
  const blockKeyShortcuts = (e: KeyboardEvent) => {
    const key = e.key ? e.key.toUpperCase() : '';
    const code = e.code ? e.code.toUpperCase() : '';
    const keyCode = e.keyCode || e.which;

    // F12
    const isF12 = key === 'F12' || code === 'F12' || keyCode === 123;

    // Ctrl + Shift + I (Inspect)
    const isCtrlShiftI = (e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'I' || code === 'KEYI' || keyCode === 73);

    // Ctrl + Shift + J (Console)
    const isCtrlShiftJ = (e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'J' || code === 'KEYJ' || keyCode === 74);

    // Ctrl + Shift + C (Element selector)
    const isCtrlShiftC = (e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'C' || code === 'KEYC' || keyCode === 67);

    // Ctrl + Shift + K (Firefox console)
    const isCtrlShiftK = (e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'K' || code === 'KEYK' || keyCode === 75);

    // Ctrl + U (Ver código fuente)
    const isCtrlU = (e.ctrlKey || e.metaKey) && !e.shiftKey && (key === 'U' || code === 'KEYU' || keyCode === 85);

    // Ctrl + S (Guardar página)
    const isCtrlS = (e.ctrlKey || e.metaKey) && !e.shiftKey && (key === 'S' || code === 'KEYS' || keyCode === 83);

    // Ctrl + P (Imprimir)
    const isCtrlP = (e.ctrlKey || e.metaKey) && (key === 'P' || code === 'KEYP' || keyCode === 80);

    // F5 o Ctrl + R / Ctrl + Shift + R (Recarga)
    const isF5 = key === 'F5' || code === 'F5' || keyCode === 116;
    const isCtrlR = (e.ctrlKey || e.metaKey) && (key === 'R' || code === 'KEYR' || keyCode === 82);

    if (
      isF12 ||
      isCtrlShiftI ||
      isCtrlShiftJ ||
      isCtrlShiftC ||
      isCtrlShiftK ||
      isCtrlU ||
      isCtrlS ||
      isCtrlP ||
      isF5 ||
      isCtrlR
    ) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  };

  window.addEventListener('keydown', blockKeyShortcuts, { capture: true });
  document.addEventListener('keydown', blockKeyShortcuts, { capture: true });
  window.addEventListener('keyup', blockKeyShortcuts, { capture: true });

  // 3. Trampa de debugger activa en bucle para congelar cualquier intento de adjuntar DevTools
  try {
    const loopDebuggerTrap = () => {
      const startTime = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const endTime = performance.now();

      // Si el tiempo de ejecución supera los 100ms, significa que DevTools está abierto y pausado
      if (endTime - startTime > 100) {
        document.body.innerHTML = '';
        window.location.reload();
      }
    };

    setInterval(loopDebuggerTrap, 1000);
  } catch {}

  // 4. Detección por discrepancia de tamaño de ventana (cuando se abre la barra lateral o inferior de DevTools)
  let devtoolsDetected = false;
  const checkWindowDimensions = () => {
    if (devtoolsDetected) return;
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
      // DevTools detectado
      devtoolsDetected = true;
      try {
        console.clear();
      } catch {}
    }
  };

  window.addEventListener('resize', checkWindowDimensions, { passive: true });
}
