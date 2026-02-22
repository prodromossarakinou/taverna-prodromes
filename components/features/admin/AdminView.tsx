'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PackageOpen, Plus, Search, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
// Σημείωση: Προσωρινά χρησιμοποιούμε native <select> αντί για Radix Select
// για να αποφύγουμε πιθανό runtime ασυμβατό που εμποδίζει το άνοιγμα του Admin View.
import { useOrders } from '@/contexts/OrderContext';
import { MenuItem, OrderCategory } from '@/types/order';
import { MenuItemCard } from './MenuItemCard';
import { MenuItemForm } from './MenuItemForm';

// Δυναμικές κατηγορίες (παράγονται από τα Menu Items)

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'category';

interface AdminViewProps {
  onSwitchView: (view: 'waiter' | 'kitchen' | 'admin') => void;
  ThemeToggle: React.ReactNode;
}

export function AdminView({ onSwitchView, ThemeToggle }: AdminViewProps) {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<OrderCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const hasActiveFilters = Boolean(searchQuery.trim()) || categoryFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'name-asc';

  // Εξαγωγή μοναδικών κατηγοριών από τα τρέχοντα menu items (ενεργά/ανενεργά)
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const it of menuItems) {
      if (it.category) set.add(it.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'el')) as OrderCategory[];
  }, [menuItems]);

  const filteredAndSortedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let items = menuItems.filter((item) => {
      if (!query) return true;
      const categoryValue = (item.category ?? '').toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        categoryValue.includes(query) ||
        (item.extraNotes ?? '').toLowerCase().includes(query)
      );
    });

    if (categoryFilter !== 'all') {
      items = items.filter((item) => item.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      items = items.filter((item) => (statusFilter === 'active' ? item.active !== false : item.active === false));
    }

    const sorted = [...items];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'name-desc':
          return b.name.localeCompare(a.name, 'el');
        case 'price-asc':
          return (a.price ?? 0) - (b.price ?? 0);
        case 'price-desc':
          return (b.price ?? 0) - (a.price ?? 0);
        case 'category':
          return a.category.localeCompare(b.category, 'el');
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name, 'el');
      }
    });
    return sorted;
  }, [menuItems, searchQuery, categoryFilter, statusFilter, sortBy]);

  const openCreate = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSave = (item: Omit<MenuItem, 'id'>) => {
    if (editingItem) {
      updateMenuItem(editingItem.id, item);
    } else {
      addMenuItem(item);
    }
  };

  const handleDelete = () => {
    if (!editingItem) return;
    deleteMenuItem(editingItem.id);
    setIsFormOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSortBy('name-asc');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b-2 border-border bg-white dark:bg-gray-800 p-4 dark:border-gray-700/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-muted-foreground" />
            <h1 className="text-xl font-bold">Admin Menu</h1>
          </div>
          <div className="flex items-center gap-2">
            {ThemeToggle}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSwitchView('waiter')}
              className="h-9 px-3 dark:bg-gray-800 dark:border-gray-700/80"
            >
              Waiter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSwitchView('kitchen')}
              className="h-9 px-3 dark:bg-gray-800 dark:border-gray-700/80"
            >
              Kitchen
            </Button>
          </div>
        </div>

        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Αναζήτηση προϊόντος, κατηγορίας ή σημειώσεων..."
            className="h-11 pl-9 pr-10 bg-gray-50 dark:bg-gray-900"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <div className="w-[200px]">
            <select
              className="h-9 w-full rounded-md border bg-input-background px-3 text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:border-gray-700"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as OrderCategory | 'all')}
            >
              <option value="all">Όλες</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="w-[150px]">
            <select
              className="h-9 w-full rounded-md border bg-input-background px-3 text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:border-gray-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">Όλες</option>
              <option value="active">Ενεργά</option>
              <option value="inactive">Ανενεργά</option>
            </select>
          </div>
          <div className="w-[180px]">
            <select
              className="h-9 w-full rounded-md border bg-input-background px-3 text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:border-gray-700"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="name-asc">Όνομα (Α-Ω)</option>
              <option value="name-desc">Όνομα (Ω-Α)</option>
              <option value="price-asc">Τιμή (↑)</option>
              <option value="price-desc">Τιμή (↓)</option>
              <option value="category">Κατηγορία</option>
            </select>
          </div>
          {hasActiveFilters ? (
            <Button variant="outline" onClick={clearFilters}>Καθαρισμός Φίλτρων</Button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            {filteredAndSortedItems.length} από {menuItems.length} προϊόντα
            {hasActiveFilters ? ' (φιλτραρισμένα)' : ''}
          </span>
          {categoryFilter !== 'all' ? (
            <Badge className="flex items-center gap-1">
              {categoryFilter}
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className="hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ) : null}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {menuItems.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <PackageOpen className="size-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Δεν υπάρχουν προϊόντα</h2>
            <p className="text-muted-foreground">Δημιουργήστε το πρώτο σας προϊόν</p>
            <Button onClick={openCreate} className="mt-2">Νέο Προϊόν</Button>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <Search className="size-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Δεν βρέθηκαν προϊόντα</h2>
            <p className="text-muted-foreground">Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης</p>
            <Button variant="outline" onClick={clearFilters} className="mt-2">Καθαρισμός Φίλτρων</Button>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {filteredAndSortedItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onClick={() => openEdit(item)} />
            ))}
          </div>
        )}
      </div>

      {menuItems.length > 0 ? (
        <div className="border-t-2 border-border bg-white dark:bg-gray-800 p-4 shadow-2xl">
          <Button
            onClick={openCreate}
            className="w-full md:w-auto md:ml-auto h-14 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="size-5" />
            Νέο Προϊόν
          </Button>
        </div>
      ) : null}

      <MenuItemForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
        onDelete={editingItem ? handleDelete : undefined}
        editItem={editingItem}
        categories={categories}
        isMobile={isMobile}
      />
    </div>
  );
}