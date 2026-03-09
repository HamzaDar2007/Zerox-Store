import { useState } from 'react';
import { PageHeader } from '@/common/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Badge } from '@/common/components/ui/badge';
import { Settings2, Plus, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState([
    { id: '1', name: 'Color', values: ['Red', 'Blue', 'Green', 'Black', 'White'] },
    { id: '2', name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: '3', name: 'Material', values: ['Cotton', 'Polyester', 'Leather', 'Silk'] },
    { id: '4', name: 'Weight', values: ['Light', 'Medium', 'Heavy'] },
  ]);
  const [newName, setNewName] = useState('');
  const [newValues, setNewValues] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error('Attribute name is required');
      return;
    }
    const values = newValues.split(',').map(v => v.trim()).filter(Boolean);
    setAttributes(prev => [...prev, {
      id: Date.now().toString(),
      name: newName.trim(),
      values,
    }]);
    setNewName('');
    setNewValues('');
    toast.success('Attribute added');
  };

  const handleDelete = (id: string) => {
    setAttributes(prev => prev.filter(a => a.id !== id));
    toast.success('Attribute deleted');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Product Attributes" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add Attribute
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Attribute Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Color" />
            </div>
            <div className="space-y-2">
              <Label>Values (comma-separated)</Label>
              <Input value={newValues} onChange={(e) => setNewValues(e.target.value)} placeholder="e.g., Red, Blue, Green" />
            </div>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Attribute
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" /> All Attributes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {attributes.map((attr) => (
              <div key={attr.id} className="flex items-start gap-4 py-4">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{attr.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {attr.values.map((v) => (
                      <Badge key={v} variant="secondary" className="text-xs">{v}</Badge>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(attr.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
