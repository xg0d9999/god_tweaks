import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { logAppError } from '../../services/discordLogger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Capturado error de interfaz:', error, errorInfo);
    logAppError({
      error,
      context: `React Error Boundary: ${errorInfo.componentStack?.slice(0, 300) || 'Component Tree'}`,
    }).catch((e) => console.warn('[ErrorBoundary] No se pudo enviar reporte de error a Discord:', e));
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center bg-[#0a0c0f] select-none text-white">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white/[0.02] border border-rose-500/20 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/25 mx-auto flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold">Incidencia en la Aplicación</h2>
              <p className="text-xs text-[#9CA3AF]">
                Se ha producido un problema inesperado. Se ha enviado un reporte con los detalles técnicos a nuestro canal de Discord de supervisión.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-black/50 border border-white/[0.06] text-left">
                <span className="text-[10px] text-[#717680] block font-mono">Mensaje técnico:</span>
                <p className="text-xs text-rose-300 font-mono break-all line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-white transition-all cursor-pointer border border-white/[0.1]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Interfaz</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
