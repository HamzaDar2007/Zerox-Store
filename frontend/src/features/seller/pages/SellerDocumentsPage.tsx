import { useGetSellerDocumentsQuery, useAddSellerDocumentMutation } from '@/store/api';
import { useAppSelector } from '@/store';
import { PageHeader } from '@/common/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Badge } from '@/common/components/ui/badge';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { FileText, Upload, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SellerDocumentsPage() {
  const sellerId = useAppSelector((s) => s.auth.user?.id) ?? '';
  const { data, isLoading } = useGetSellerDocumentsQuery(sellerId, { skip: !sellerId });
  const [addDocument, { isLoading: uploading }] = useAddSellerDocumentMutation();
  const documents = data?.data ?? [];

  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docType, setDocType] = useState('identity');

  const handleSubmit = async () => {
    if (!docName.trim() || !docUrl.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await addDocument({ sellerId, data: { documentUrl: docUrl, documentType: docType } }).unwrap();
      toast.success('Document uploaded successfully');
      setDocName('');
      setDocUrl('');
    } catch {
      toast.error('Failed to upload document');
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'approved' || status === 'verified') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === 'rejected') return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Documents" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Documents" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Upload Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Document Name</Label>
              <Input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="e.g., Business License" />
            </div>
            <div className="space-y-2">
              <Label>Document URL</Label>
              <Input value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="identity">Identity</option>
                <option value="business">Business</option>
                <option value="tax">Tax</option>
                <option value="bank">Bank</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No documents uploaded yet</p>
          ) : (
            <div className="divide-y">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-3 py-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.documentName ?? doc.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{doc.documentType ?? doc.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcon(doc.status ?? 'pending')}
                    <Badge variant="secondary" className="capitalize">{doc.status ?? 'pending'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
