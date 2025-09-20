"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="max-w-md rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-4 text-xl font-bold text-red-600">出现错误</h2>
            <p className="mb-4 text-gray-700">
              应用程序遇到了一个错误。请刷新页面重试。
            </p>
            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-600">
                  错误详情
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-red-600">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}