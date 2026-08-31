import { Component } from 'react';

function toError(value) {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error(String(value));
  }
}

function DefaultFallback({ error, resetError }) {
  return (
    <div className="empty-state" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 500, width: '100%' }}>
        <div className="eyebrow">Operations desk · Recovery</div>
        <h1 className="page-title">A handoff went sideways.</h1>
        <p className="page-description">
          This part of the app hit an error. The rest of the app is still running.
        </p>
        {import.meta.env.DEV ? (
          <pre className="error-state" style={{ marginTop: 16, overflowX: 'auto', textAlign: 'left' }}>
            {error.message || String(error)}
          </pre>
        ) : null}
        <button type="button" onClick={resetError} className="btn btn-primary" data-testid="button-recover-error">
          Try again
        </button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error: toError(error) };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', toError(error), info.componentStack);
  }

  componentDidUpdate(previousProps) {
    if (this.state.error !== null && previousProps.resetKey !== this.props.resetKey) {
      this.resetError();
    }
  }

  resetError = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error === null) return this.props.children;
    const Fallback = this.props.FallbackComponent || DefaultFallback;
    return <Fallback error={error} resetError={this.resetError} />;
  }
}