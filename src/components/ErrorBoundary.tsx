'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-[#04060c] px-4">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-[#ef4444]/10">
              <AlertCircle className="size-8 text-[#ef4444]" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              Something Went Wrong
            </h2>
            <p className="mb-6 text-white/70">
              {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={this.handleReset}
                size="lg"
                className="bg-gradient-to-r from-[#f53049] to-[#f22a5a] hover:from-[#f53049]/90 hover:to-[#f22a5a]/90"
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/main-menu'}
                variant="outline"
                size="lg"
                className="border-[#e15f6e]/30 text-[#e15f6e] hover:bg-[#e15f6e]/10"
              >
                Back to Menu
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

