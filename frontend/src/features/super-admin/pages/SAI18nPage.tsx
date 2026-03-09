import { useState } from 'react';
import {
  useGetLanguagesQuery, useDeleteLanguageMutation, useSetDefaultLanguageMutation,
  useGetCurrenciesQuery, useDeleteCurrencyMutation, useSetDefaultCurrencyMutation,
  useCreateLanguageMutation, useCreateCurrencyMutation,
} from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { PageHeader } from '@/common/components/PageHeader';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { Input } from '@/common/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { Star, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import type { Language, Currency } from '@/common/types';

export default function SAI18nPage() {
  const [deleteType, setDeleteType] = useState<'language' | 'currency' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCreateLang, setShowCreateLang] = useState(false);
  const [showCreateCurr, setShowCreateCurr] = useState(false);
  const [langForm, setLangForm] = useState({ code: '', name: '', nativeName: '', direction: 'ltr' });
  const [currForm, setCurrForm] = useState({ code: '', name: '', symbol: '', exchangeRate: 1 });

  const { data: langsData, isLoading: langsLoading } = useGetLanguagesQuery({});
  const { data: currData, isLoading: currLoading } = useGetCurrenciesQuery({});
  const [deleteLang] = useDeleteLanguageMutation();
  const [deleteCurr] = useDeleteCurrencyMutation();
  const [setDefaultLang] = useSetDefaultLanguageMutation();
  const [setDefaultCurr] = useSetDefaultCurrencyMutation();
  const [createLang, { isLoading: creatingLang }] = useCreateLanguageMutation();
  const [createCurr, { isLoading: creatingCurr }] = useCreateCurrencyMutation();

  const languages: Language[] = langsData?.data ?? [];
  const currencies: Currency[] = currData?.data ?? [];

  const handleDefault = async (type: 'language' | 'currency', id: string) => {
    try {
      if (type === 'language') await setDefaultLang(id).unwrap();
      else await setDefaultCurr(id).unwrap();
      toast.success(`Default ${type} updated`);
    } catch {
      toast.error(`Failed to set default ${type}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;
    try {
      if (deleteType === 'language') await deleteLang(deleteId).unwrap();
      else await deleteCurr(deleteId).unwrap();
      toast.success(`${deleteType === 'language' ? 'Language' : 'Currency'} deleted`);
      setDeleteId(null);
      setDeleteType(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const langColumns: ColumnDef<Language, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Language',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.nativeName}</p>
        </div>
      ),
    },
    { accessorKey: 'code', header: 'Code' },
    {
      accessorKey: 'direction',
      header: 'Direction',
      cell: ({ row }) => <Badge variant="outline">{row.original.direction}</Badge>,
    },
    {
      accessorKey: 'isDefault',
      header: 'Default',
      cell: ({ row }) =>
        row.original.isDefault ? (
          <Badge>Default</Badge>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => handleDefault('language', row.original.id)}>
            <Star className="mr-1 h-3 w-3" /> Set Default
          </Button>
        ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        !row.original.isDefault && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setDeleteType('language'); setDeleteId(row.original.id); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
    },
  ];

  const currColumns: ColumnDef<Currency, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Currency',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.symbol}</p>
        </div>
      ),
    },
    { accessorKey: 'code', header: 'Code' },
    {
      accessorKey: 'exchangeRate',
      header: 'Rate',
      cell: ({ row }) => row.original.exchangeRate?.toFixed(4) ?? '—',
    },
    {
      accessorKey: 'isDefault',
      header: 'Default',
      cell: ({ row }) =>
        row.original.isDefault ? (
          <Badge>Default</Badge>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => handleDefault('currency', row.original.id)}>
            <Star className="mr-1 h-3 w-3" /> Set Default
          </Button>
        ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        !row.original.isDefault && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setDeleteType('currency'); setDeleteId(row.original.id); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Internationalization" description="Manage languages, currencies, and translations" />

      <Tabs defaultValue="languages">
        <TabsList>
          <TabsTrigger value="languages">Languages ({languages.length})</TabsTrigger>
          <TabsTrigger value="currencies">Currencies ({currencies.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setShowCreateLang(true)}><Plus className="mr-2 h-4 w-4" /> Add Language</Button>
          </div>
          <DataTable columns={langColumns} data={languages} isLoading={langsLoading} emptyTitle="No languages" />
        </TabsContent>

        <TabsContent value="currencies" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setShowCreateCurr(true)}><Plus className="mr-2 h-4 w-4" /> Add Currency</Button>
          </div>
          <DataTable columns={currColumns} data={currencies} isLoading={currLoading} emptyTitle="No currencies" />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) { setDeleteId(null); setDeleteType(null); } }}
        title={`Delete ${deleteType === 'language' ? 'Language' : 'Currency'}`}
        description="This will permanently remove this item."
        onConfirm={handleDelete}
      />

      {/* Create Language Dialog */}
      <Dialog open={showCreateLang} onOpenChange={setShowCreateLang}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Language</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Code (e.g. en)" value={langForm.code} onChange={(e) => setLangForm((f) => ({ ...f, code: e.target.value }))} />
            <Input placeholder="Name (e.g. English)" value={langForm.name} onChange={(e) => setLangForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Native name (optional)" value={langForm.nativeName} onChange={(e) => setLangForm((f) => ({ ...f, nativeName: e.target.value }))} />
            <Select value={langForm.direction} onValueChange={(v) => setLangForm((f) => ({ ...f, direction: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ltr">LTR</SelectItem>
                <SelectItem value="rtl">RTL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateLang(false)}>Cancel</Button>
            <Button disabled={creatingLang} onClick={async () => {
              if (!langForm.code || !langForm.name) { toast.error('Code and name required'); return; }
              try {
                await createLang({ code: langForm.code, name: langForm.name, nativeName: langForm.nativeName || undefined, direction: langForm.direction as any }).unwrap();
                toast.success('Language added');
                setShowCreateLang(false);
                setLangForm({ code: '', name: '', nativeName: '', direction: 'ltr' });
              } catch { toast.error('Failed to create language'); }
            }}>
              {creatingLang ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Currency Dialog */}
      <Dialog open={showCreateCurr} onOpenChange={setShowCreateCurr}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Currency</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Code (e.g. USD)" value={currForm.code} onChange={(e) => setCurrForm((f) => ({ ...f, code: e.target.value }))} />
            <Input placeholder="Name (e.g. US Dollar)" value={currForm.name} onChange={(e) => setCurrForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Symbol (e.g. $)" value={currForm.symbol} onChange={(e) => setCurrForm((f) => ({ ...f, symbol: e.target.value }))} />
            <Input type="number" step="0.0001" placeholder="Exchange rate" value={currForm.exchangeRate} onChange={(e) => setCurrForm((f) => ({ ...f, exchangeRate: parseFloat(e.target.value) || 1 }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCurr(false)}>Cancel</Button>
            <Button disabled={creatingCurr} onClick={async () => {
              if (!currForm.code || !currForm.name || !currForm.symbol) { toast.error('Code, name and symbol required'); return; }
              try {
                await createCurr({ code: currForm.code, name: currForm.name, symbol: currForm.symbol, exchangeRate: currForm.exchangeRate }).unwrap();
                toast.success('Currency added');
                setShowCreateCurr(false);
                setCurrForm({ code: '', name: '', symbol: '', exchangeRate: 1 });
              } catch { toast.error('Failed to create currency'); }
            }}>
              {creatingCurr ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
