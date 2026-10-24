import React from 'react';

export class PageErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Page rendering failed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          <p>This page could not be displayed. Reload the page or choose another section.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
