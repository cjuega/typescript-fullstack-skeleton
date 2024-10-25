import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // You can also log the error to an error reporting service
        console.error('Uncaught error:', error, errorInfo);
    }

    private resetError() {
        this.setState({ hasError: false });
    }

    render() {
        if (this.state.hasError) {
            return (
                <>
                    <h2>Something went wrong.</h2>
                    <Link onClick={this.resetError} to={'/'}>
                        Return to home
                    </Link>
                </>
            );
        }

        return this.props.children;
    }
}
