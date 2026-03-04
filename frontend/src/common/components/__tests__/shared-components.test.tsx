import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { PageHeader } from '@/common/components/PageHeader';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('renders with label', () => {
    render(<LoadingSpinner label="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeTruthy();
  });
});

describe('StatusBadge', () => {
  it('renders status text', () => {
    render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText('ACTIVE')).toBeTruthy();
  });
});

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No items" description="Nothing here yet" />);
    expect(screen.getByText('No items')).toBeTruthy();
    expect(screen.getByText('Nothing here yet')).toBeTruthy();
  });
});

describe('PageHeader', () => {
  it('renders title and description', () => {
    render(<PageHeader title="Dashboard" description="Overview of stats" />);
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Overview of stats')).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <PageHeader title="Test">
        <button>Action</button>
      </PageHeader>,
    );
    expect(screen.getByText('Action')).toBeTruthy();
  });
});
