import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import type { ColumnDef } from '@tanstack/react-table'

interface TestRow {
  id: string
  name: string
  email: string
}

const testData: TestRow[] = [
  { id: '1', name: 'Alice', email: 'alice@test.com' },
  { id: '2', name: 'Bob', email: 'bob@test.com' },
  { id: '3', name: 'Charlie', email: 'charlie@test.com' },
]

const columns: ColumnDef<TestRow>[] = [
  { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Name</SortHeader> },
  { accessorKey: 'email', header: 'Email' },
]

describe('DataTable', () => {
  it('renders data rows', () => {
    render(<DataTable columns={columns} data={testData} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('shows loading skeletons', () => {
    const { container } = render(<DataTable columns={columns} data={[]} isLoading />)
    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('shows empty state when no data', () => {
    render(<DataTable columns={columns} data={[]} />)
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('renders sort header buttons', () => {
    render(<DataTable columns={columns} data={testData} />)
    expect(screen.getByRole('button', { name: /Name/i })).toBeInTheDocument()
  })

  it('sorts data when sort header clicked', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={testData} />)
    const sortBtn = screen.getByRole('button', { name: /Name/i })
    await user.click(sortBtn)
    // After clicking, data should be sorted (ascending by name)
    const allCells = screen.getAllByRole('cell')
    const nameCells = allCells.filter(
      (cell) => cell.textContent === 'Alice' || cell.textContent === 'Bob' || cell.textContent === 'Charlie'
    )
    expect(nameCells[0].textContent).toBe('Alice')
    expect(nameCells[1].textContent).toBe('Bob')
    expect(nameCells[2].textContent).toBe('Charlie')
  })

  it('renders search input', () => {
    render(<DataTable columns={columns} data={testData} searchPlaceholder="Search..." />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('renders export button when getExportRow is provided', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        getExportRow={(r) => ({ Name: r.name, Email: r.email })}
      />,
    )
    expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument()
  })

  it('renders row selection checkboxes when enabled', () => {
    const { container } = render(
      <DataTable columns={columns} data={testData} enableRowSelection />,
    )
    const checkboxes = container.querySelectorAll('[role="checkbox"]')
    // 1 header checkbox + 3 row checkboxes
    expect(checkboxes.length).toBe(4)
  })

  it('shows selected count and bulk delete button', async () => {
    const user = userEvent.setup()
    let deletedRows: TestRow[] = []
    const { container } = render(
      <DataTable
        columns={columns}
        data={testData}
        enableRowSelection
        onBulkDelete={(rows) => { deletedRows = rows }}
      />,
    )
    // Click the "select all" checkbox in the header
    const headerCheckbox = container.querySelectorAll('[role="checkbox"]')[0]
    await user.click(headerCheckbox)
    expect(screen.getByText('3 selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()

    // Click bulk delete
    await user.click(screen.getByRole('button', { name: /Delete/i }))
    expect(deletedRows.length).toBe(3)
  })

  it('shows pagination controls', () => {
    render(<DataTable columns={columns} data={testData} />)
    expect(screen.getByText(/row\(s\)/)).toBeInTheDocument()
  })
})
