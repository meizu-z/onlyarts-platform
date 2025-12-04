import React from 'react';
import Button from './Button';
import Card from './Card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, etc.)
      // logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI can be provided via props
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
          <Card className="max-w-2xl w-full p-8">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={40} className="text-red-500" />
              </div>

              {/* Error Message */}
              <h1 className="text-3xl font-bold text-[#f2e9dd] mb-3">
                Oops! Something went wrong
              </h1>
              <p className="text-[#f2e9dd]/70 mb-6">
                {this.state.errorCount > 3
                  ? "This error keeps happening. Please try reloading the page or contact support."
                  : "We encountered an unexpected error. Don't worry, your data is safe."}
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
                  <p className="text-sm font-mono text-red-400 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs text-[#f2e9dd]/50">
                      <summary className="cursor-pointer hover:text-[#f2e9dd]/70 mb-2">
                        Stack Trace
                      </summary>
                      <pre className="whitespace-pre-wrap overflow-auto max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="primary"
                  className="bg-gradient-to-r from-[#7C5FFF] to-[#B15FFF]"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="secondary"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="ghost"
                >
                  <Home size={16} className="mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Additional Help */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-sm text-[#f2e9dd]/50">
                  If this problem persists, please{' '}
                  <a
                    href="mailto:support@onlyarts.com"
                    className="text-[#7C5FFF] hover:text-[#B15FFF] underline"
                  >
                    contact support
                  </a>
                  {' '}or try clearing your browser cache.
                </p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
