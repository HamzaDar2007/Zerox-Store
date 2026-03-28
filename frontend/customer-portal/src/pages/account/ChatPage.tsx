import { useQuery } from '@tanstack/react-query'
import { chatApi } from '@/services/api'
import { PageLoader } from '@/components/common/LoadingSpinner'

export default function ChatPage() {
  const { data: threads, isLoading } = useQuery({
    queryKey: ['chat', 'threads'],
    queryFn: () => chatApi.listThreads(),
  })

  if (isLoading) return <PageLoader />

  const items = threads?.data?.items ?? threads?.data ?? []

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Help & Chat</h1>
      {items.length === 0 ? (
        <p className="text-gray-500">No conversations yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((thread: { id: string; subject?: string; status?: string; createdAt?: string }) => (
            <li key={thread.id} className="p-4 border rounded-lg">
              <p className="font-medium">{thread.subject ?? 'Chat'}</p>
              <p className="text-sm text-gray-500">{thread.status} &middot; {thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : ''}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
