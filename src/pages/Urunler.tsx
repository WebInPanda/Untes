import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, STORAGE_KEYS } from '../lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Urunler() {
  const [products, setProducts] = useLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const [categories, setCategories] = useLocalStorage<string[]>(STORAGE_KEYS.CATEGORIES, []);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [cat, setCat] = useState('');

  const [newCat, setNewCat] = useState('');
  const [bulkPercent, setBulkPercent] = useState('');
  
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const addProduct = () => {
    if (!name || !price || !stock) return;
    setProducts([...products, { name, price: parseFloat(price), stock: parseInt(stock, 10), category: cat }]);
    setName(''); setPrice(''); setStock('');
  };

  const deleteProduct = (idx: number) => {
    if(confirm("Silmek istediğinize emin misiniz?")) {
       const p = [...products];
       p.splice(idx, 1);
       setProducts(p);
    }
  };

  const addCategory = () => {
    if (!newCat || categories.includes(newCat)) return;
    setCategories([...categories, newCat]);
    setNewCat('');
  };

  const deleteCategory = (c: string) => {
    setCategories(categories.filter(cat => cat !== c));
  };

  const applyBulkRaise = () => {
    const p = parseFloat(bulkPercent);
    if (isNaN(p)) return;
    setProducts(products.map(prod => ({
      ...prod,
      price: parseFloat((prod.price * (1 + p / 100)).toFixed(2))
    })));
    setBulkPercent('');
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-col md:flex-row h-full gap-6 p-6">
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <Card>
          <CardHeader><CardTitle>Yeni Ürün Ekle</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input data-testid="input-product-name" placeholder="Ürün Adı" value={name} onChange={e => setName(e.target.value)} />
            <Input data-testid="input-product-price" placeholder="Fiyat (TL)" type="number" value={price} onChange={e => setPrice(e.target.value)} />
            <Input data-testid="input-product-stock" placeholder="Stok Adedi" type="number" value={stock} onChange={e => setStock(e.target.value)} />
            
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger data-testid="select-product-cat"><SelectValue placeholder="Kategori Seç" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kategorisiz</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button data-testid="button-create-product" onClick={addProduct}>Ürün Ekle</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Kategoriler</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input data-testid="input-new-category" placeholder="Yeni Kategori" value={newCat} onChange={e => setNewCat(e.target.value)} />
              <Button data-testid="button-add-category" onClick={addCategory}>Ekle</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map(c => (
                <div key={c} className="bg-muted px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                  {c}
                  <button data-testid={`button-delete-cat-${c}`} onClick={() => deleteCategory(c)} className="text-destructive hover:text-red-400"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Toplu Fiyat Güncelle</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input data-testid="input-bulk-raise" placeholder="% Zam" type="number" value={bulkPercent} onChange={e => setBulkPercent(e.target.value)} />
            <Button data-testid="button-apply-bulk-raise" onClick={applyBulkRaise}>Uygula</Button>
          </CardContent>
        </Card>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <div className="flex gap-4">
          <Input data-testid="input-search-products" className="flex-1" placeholder="Ürün Ara..." value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger data-testid="select-filter-cat" className="w-[180px]"><SelectValue placeholder="Tüm Kategoriler" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max overflow-y-auto">
          {filtered.map((p, i) => (
            <Card key={i} data-testid={`card-product-${i}`}>
              <CardContent className="p-4 flex justify-between items-center relative group">
                <div>
                  <p className="font-bold text-lg">{p.name}</p>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">{p.category && p.category !== 'none' ? p.category : 'Kategorisiz'}</span>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-bold text-xl">{p.price} TL</p>
                    <p className={`text-sm font-semibold ${p.stock > 0 ? 'text-green-500' : 'text-destructive'}`}>Stok: {p.stock}</p>
                  </div>
                  <Button data-testid={`button-delete-product-${i}`} variant="ghost" size="icon" onClick={() => deleteProduct(products.indexOf(p))} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive">
                    <Trash2 size={20} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <div className="text-muted-foreground col-span-2 text-center py-8">Ürün bulunamadı.</div>}
        </div>
      </div>
    </div>
  );
}
