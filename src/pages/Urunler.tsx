import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, STORAGE_KEYS } from '../lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Trash2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Urunler() {
  const [products, setProducts] = useLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const [categories, setCategories] = useLocalStorage<string[]>(STORAGE_KEYS.CATEGORIES, []);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [cat, setCat] = useState('');
  const [image, setImage] = useState<string>('');

  const [newCat, setNewCat] = useState('');
  const [bulkPercent, setBulkPercent] = useState('');
  
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addProduct = () => {
    if (!name || !price || !stock) return;
    setProducts([...products, { name, price: parseFloat(price), stock: parseInt(stock, 10), category: cat, image }]);
    setName(''); setPrice(''); setStock(''); setImage('');
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

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Ürün Resmi</label>
              <input 
                data-testid="input-product-image"
                type="file" 
                accept="image/*" 
                onChange={handleImageSelect}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {image && (
                <div className="relative w-full max-h-32 rounded border border-border overflow-hidden">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-max overflow-y-auto">
          {filtered.map((p, i) => (
            <Card key={i} data-testid={`card-product-${i}`} className="flex flex-col h-full">
              {p.image && (
                <div 
                  className="w-full h-24 sm:h-28 overflow-hidden rounded-t border-b border-border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImage(p.image)}
                >
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-3 flex flex-col flex-1">
                <div className="flex-1">
                  <p className="font-bold text-base sm:text-lg">{p.name}</p>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded inline-block mt-1">{p.category && p.category !== 'none' ? p.category : 'Kategorisiz'}</span>
                </div>
                <div className="flex justify-between items-end mt-4 gap-2">
                  <div>
                    <p className="font-bold text-lg sm:text-xl">{p.price} TL</p>
                    <p className={`text-xs sm:text-sm font-semibold ${p.stock > 0 ? 'text-green-500' : 'text-destructive'}`}>Stok: {p.stock}</p>
                  </div>
                  <Button 
                    data-testid={`button-delete-product-${i}`} 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteProduct(products.indexOf(p))} 
                    className="text-destructive hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <div className="text-muted-foreground col-span-2 md:col-span-3 text-center py-8">Ürün bulunamadı.</div>}
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-4 flex items-center justify-center">
          {selectedImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img src={selectedImage} alt="Büyütülmüş Resim" className="max-w-full max-h-full object-contain" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
