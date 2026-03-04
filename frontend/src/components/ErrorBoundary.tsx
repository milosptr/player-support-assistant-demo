import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-100">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-400">An unexpected error occurred.</p>
            <a
              href="/"
              className="mt-4 inline-block rounded-lg bg-teal-500/15 px-4 py-2 text-sm font-medium text-teal-300 ring-1 ring-teal-500/30 transition-colors hover:bg-teal-500/25 hover:ring-teal-500/50"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
