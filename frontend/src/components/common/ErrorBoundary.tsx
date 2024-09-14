// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import ErrorComponent from "./Error";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("Error caught in ErrorBoundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorComponent message={`An error occured: ${this.state.errorMessage}`} /> ;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;