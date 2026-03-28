import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <AlertTriangle className="h-12 w-12 text-[#EF4444] mb-4" />
            <h3 className="text-lg font-semibold text-[#0F172A] mb-1">Something went wrong</h3>
            <p className="text-sm text-[#64748B] mb-4">An unexpected error occurred. Please try again.</p>
            <Button onClick={() => this.setState({ hasError: false })}>Try Again</Button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
