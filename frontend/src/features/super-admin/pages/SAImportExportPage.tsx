import { useState } from 'react';
import { PageHeader } from '@/common/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Upload, Download, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SAImportExportPage() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('products');
  const [importUrl, setImportUrl] = useState('');

  const entities = [
    { value: 'products', label: 'Products' },
    { value: 'categories', label: 'Categories' },
    { value: 'users', label: 'Users' },
    { value: 'orders', label: 'Orders' },
    { value: 'sellers', label: 'Sellers' },
    { value: 'inventory', label: 'Inventory' },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${selectedEntity} exported successfully. Check your downloads.`);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importUrl.trim()) {
      toast.error('Please provide a file URL');
      return;
    }
    setImporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${selectedEntity} imported successfully`);
      setImportUrl('');
    } catch {
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Import / Export" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" /> Export Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Entity Type</Label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {entities.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <p className="text-sm text-muted-foreground">
              Export all {selectedEntity} data as a CSV file for backup or migration.
            </p>
            <Button onClick={handleExport} disabled={exporting} className="w-full">
              {exporting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Export {selectedEntity}</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-500" /> Import Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Entity Type</Label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {entities.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>CSV File URL</Label>
              <Input value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 dark:bg-yellow-950/20 dark:border-yellow-800">
              <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Import will add or update existing records. Duplicates are matched by ID.
              </p>
            </div>
            <Button onClick={handleImport} disabled={importing} className="w-full">
              {importing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" /> Import {selectedEntity}</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Import/Export History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No import/export history yet</p>
        </CardContent>
      </Card>
    </div>
  );
}
