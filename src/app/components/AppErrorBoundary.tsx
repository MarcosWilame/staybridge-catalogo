import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unexpected application error', error.name, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4df] px-5 text-center">
        <div className="max-w-md rounded-3xl border border-[var(--green-dark)]/15 bg-white p-8 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--green-medium)]">
            Staybridge London
          </p>
          <h1 className="mt-3 text-2xl font-black text-[var(--green-dark)]">
            Não foi possível carregar esta página
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Tente novamente. Seus dados não foram enviados nem alterados.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 min-h-12 w-full rounded-xl bg-[var(--green-dark)] px-5 font-black text-white transition hover:bg-[var(--green-medium)]"
          >
            Recarregar página
          </button>
        </div>
      </main>
    );
  }
}
