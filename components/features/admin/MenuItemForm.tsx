'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MenuItem, OrderCategory } from '@/types/order';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { toast } from 'sonner';

const CATEGORY_LABELS: Record<OrderCategory, string> = {
  'Κρύα': 'Κρύα Κουζίνα/Σαλάτες',
  'Ζεστές': 'Ζεστές Σαλάτες',
  'Ψησταριά': 'Ψησταριά',
  'Μαγειρευτό': 'Μαγειρευτό',
  'Ποτά': 'Αναψυκτικά/Ποτά',
};

interface MenuItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Omit<MenuItem, 'id'>) => void;
  onDelete?: () => void;
  editItem?: MenuItem;
  isMobile?: boolean;
}

export function MenuItemForm({ open, onOpenChange, onSave, onDelete, editItem, isMobile = false }: MenuItemFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<OrderCategory>('Κρύα');
  const [price, setPrice] = useState('');
  const [active, setActive] = useState(true);
  const [extraNotes, setExtraNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editItem) {
      setName(editItem.name ?? '');
      setCategory(editItem.category ?? 'Κρύα');
      setPrice(editItem.price != null ? editItem.price.toFixed(2) : '');
      setActive(editItem.active !== false);
      setExtraNotes(editItem.extraNotes ?? '');
    } else {
      setName('');
      setCategory('Κρύα');
      setPrice('');
      setActive(true);
      setExtraNotes('');
    }
    setIsDirty(false);
  }, [open, editItem]);

  useEffect(() => {
    if (!open) return;
    const initial = editItem
      ? {
          name: editItem.name ?? '',
          category: editItem.category ?? 'Κρύα',
          price: editItem.price != null ? editItem.price.toFixed(2) : '',
          active: editItem.active !== false,
          extraNotes: editItem.extraNotes ?? '',
        }
      : {
          name: '',
          category: 'Κρύα' as OrderCategory,
          price: '',
          active: true,
          extraNotes: '',
        };
    const dirty =
      name !== initial.name ||
      category !== initial.category ||
      price !== initial.price ||
      active !== initial.active ||
      extraNotes !== initial.extraNotes;
    setIsDirty(dirty);
  }, [open, editItem, name, category, price, active, extraNotes]);

  const isValid = useMemo(() => {
    const parsed = Number(price);
    return (
      name.trim().length > 0 &&
      category != null &&
      Number.isFinite(parsed) &&
      parsed >= 0.01 &&
      parsed <= 999.99
    );
  }, [name, category, price]);

  const handleCancel = () => {
    if (isDirty) {
      const confirmClose = window.confirm('Έχετε μη αποθηκευμένες αλλαγές. Θέλετε να συνεχίσετε;');
      if (!confirmClose) return;
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!onDelete) return;
    const confirmDelete = window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε το προϊόν;');
    if (!confirmDelete) return;
    onDelete();
    toast.success('Το προϊόν διαγράφηκε');
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Το όνομα είναι υποχρεωτικό');
      return;
    }
    if (!category) {
      toast.error('Επιλέξτε κατηγορία');
      return;
    }
    const parsed = Number(price);
    if (!Number.isFinite(parsed) || parsed < 0.01 || parsed > 999.99) {
      toast.error('Εισάγετε έγκυρη τιμή (0.01 - 999.99)');
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSave({
      name: name.trim(),
      category,
      price: parsed,
      active,
      extraNotes: extraNotes.trim() || null,
    });
    setIsLoading(false);
    toast.success(editItem ? 'Το προϊόν ενημερώθηκε' : 'Το προϊόν δημιουργήθηκε');
    onOpenChange(false);
  };

  const content = (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Όνομα Προϊόντος <span className="text-red-500">*</span>
        </label>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={50}
          placeholder="π.χ. Μουσακάς"
          className="h-12"
          aria-required="true"
        />
        <div className="text-xs text-muted-foreground">{name.length}/50 χαρακτήρες</div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Κατηγορία <span className="text-red-500">*</span>
        </label>
        <Select value={category} onValueChange={(value) => setCategory(value as OrderCategory)}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Κατηγορία" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(CATEGORY_LABELS) as OrderCategory[]).map((cat) => (
              <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Τιμή (€) <span className="text-red-500">*</span>
        </label>
        <Input
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          max="999.99"
          placeholder="0.00"
          className="h-12"
          aria-required="true"
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <div className="text-sm font-medium">Κατάσταση</div>
          <div className="text-xs text-muted-foreground">{active ? 'Ενεργό' : 'Ανενεργό'}</div>
        </div>
        <Switch checked={active} onCheckedChange={setActive} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Σημειώσεις (προαιρετικό)</label>
        <Textarea
          value={extraNotes}
          onChange={(event) => setExtraNotes(event.target.value)}
          maxLength={200}
          placeholder="π.χ. Περιέχει γλουτένη"
          className="h-24"
        />
        <div className="text-xs text-muted-foreground">{extraNotes.length}/200 χαρακτήρες</div>
      </div>
    </div>
  );

  const actions = (
    <div className="flex w-full items-center justify-between gap-4">
      {editItem ? (
        <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
          Διαγραφή
        </Button>
      ) : (
        <div />
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
          Ακύρωση
        </Button>
        <Button onClick={handleSave} disabled={!isValid || isLoading}>
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
          Αποθήκευση
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>{editItem ? 'Επεξεργασία Προϊόντος' : 'Νέο Προϊόν'}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4">
            {content}
          </div>
          <SheetFooter className="border-t pt-4">
            {actions}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Επεξεργασία Προϊόντος' : 'Νέο Προϊόν'}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 flex-col overflow-y-auto pr-2">
          {content}
        </div>
        <DialogFooter className="border-t pt-4">
          {actions}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}