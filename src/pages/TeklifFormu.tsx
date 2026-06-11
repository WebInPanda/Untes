import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateQuote } from '../lib/pdfUtils';
import { Trash2, Plus } from 'lucide-react';

export default function TeklifFormu() {
  const [firma, setFirma] = useState({ name: 'Benim Firmam Ltd.', phone: '0555 123 4567', email: 'info@firma.com', address: 'İstanbul, Türkiye' });
  const [musteri, setMusteri] = useState({ name: '', phone: '', email: '', address: '' });
  const [teklifNo, setTeklifNo] = useState(`TKF-${new Date().getFullYear()}-${Math.floor(Math.random()*10000)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Bu teklif 30 gün süreyle geçerlidir.\nÖdeme şartları: %50 peşin, kalanı teslimatta.');
  
  const [items, setItems] = useState([{ name: '', qty: 1, price: 0, total: 0 }]);

  const updateItem = (idx: number, field: string, val: string | number) => {
    const newItems = [...items];
    (newItems[idx] as any)[field] = val;
    if (field === 'qty' || field === 'price') {
      newItems[idx].total = newItems[idx].qty * newItems[idx].price;
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { name: '', qty: 1, price: 0, total: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const subTotal = items.reduce((acc, i) => acc + i.total, 0);

  const handleDownload = () => {
    generateQuote(firma, musteri, items, subTotal, notes);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 p-6 overflow-hidden">
      
      {/* LEFT PANEL - FORM */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        <h1 className="text-3xl font-bold">Teklif Oluşturucu</h1>
        
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-primary border-b border-border pb-2">Firma Bilgileri (Gönderen)</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input data-testid="input-firma-name" placeholder="Firma Adı" value={firma.name} onChange={e => setFirma({...firma, name: e.target.value})} />
              <Input data-testid="input-firma-phone" placeholder="Telefon" value={firma.phone} onChange={e => setFirma({...firma, phone: e.target.value})} />
              <Input data-testid="input-firma-email" placeholder="E-posta" value={firma.email} onChange={e => setFirma({...firma, email: e.target.value})} />
              <Input data-testid="input-firma-address" placeholder="Adres" value={firma.address} onChange={e => setFirma({...firma, address: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-primary border-b border-border pb-2">Müşteri Bilgileri</h3>
              <Input data-testid="input-musteri-name" placeholder="Müşteri / Firma Adı" value={musteri.name} onChange={e => setMusteri({...musteri, name: e.target.value})} />
              <Input data-testid="input-musteri-phone" placeholder="Telefon" value={musteri.phone} onChange={e => setMusteri({...musteri, phone: e.target.value})} />
              <Input data-testid="input-musteri-email" placeholder="E-posta" value={musteri.email} onChange={e => setMusteri({...musteri, email: e.target.value})} />
              <Input data-testid="input-musteri-address" placeholder="Adres" value={musteri.address} onChange={e => setMusteri({...musteri, address: e.target.value})} />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-primary border-b border-border pb-2">Teklif Detayları</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Teklif No</label>
                <Input data-testid="input-teklif-no" value={teklifNo} onChange={e => setTeklifNo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tarih</label>
                <Input data-testid="input-teklif-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="font-bold text-primary">Ürünler / Hizmetler</h3>
              <Button data-testid="button-add-quote-item" size="sm" variant="outline" onClick={addItem}><Plus size={16} className="mr-1"/> Satır Ekle</Button>
            </div>
            
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center bg-muted/20 p-2 rounded">
                  <Input data-testid={`input-quote-item-name-${i}`} className="flex-1" placeholder="Ürün/Hizmet Adı" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
                  <Input data-testid={`input-quote-item-qty-${i}`} className="w-20 text-center" type="number" placeholder="Miktar" value={item.qty} onChange={e => updateItem(i, 'qty', parseInt(e.target.value)||0)} />
                  <Input data-testid={`input-quote-item-price-${i}`} className="w-24 text-center" type="number" placeholder="B.Fiyat" value={item.price} onChange={e => updateItem(i, 'price', parseFloat(e.target.value)||0)} />
                  <div className="w-24 text-right font-bold">{item.total} TL</div>
                  <Button data-testid={`button-delete-quote-item-${i}`} variant="ghost" size="icon" onClick={() => removeItem(i)}><Trash2 size={16} className="text-destructive"/></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-primary border-b border-border pb-2">Notlar / Şartlar</h3>
            <Textarea data-testid="textarea-quote-notes" className="min-h-[100px]" value={notes} onChange={e => setNotes(e.target.value)} />
          </CardContent>
        </Card>
        
        <Button data-testid="button-download-quote" size="lg" className="w-full text-lg mb-10" onClick={handleDownload}>📄 PDF Olarak İndir</Button>
      </div>

      {/* RIGHT PANEL - PREVIEW */}
      <div className="w-full lg:w-1/2 h-full flex flex-col bg-white text-black p-8 rounded-lg overflow-y-auto border border-border shadow-2xl scale-[0.85] origin-top">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-2xl font-black text-green-700">{firma.name || 'Firma Adı'}</h2>
            <div className="text-sm mt-2 text-gray-600">
              <p>{firma.address}</p>
              <p>{firma.phone}</p>
              <p>{firma.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold tracking-widest text-gray-800">FİYAT TEKLİFİ</h1>
            <div className="mt-4 text-sm space-y-1">
              <p><span className="font-bold text-gray-500">Teklif No:</span> {teklifNo}</p>
              <p><span className="font-bold text-gray-500">Tarih:</span> {new Date(date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-md mb-8">
          <h3 className="font-bold text-gray-500 uppercase text-xs mb-2 tracking-wider">Sayın / Firma:</h3>
          <p className="font-bold text-lg">{musteri.name || 'Müşteri Adı'}</p>
          <p className="text-sm text-gray-600">{musteri.address}</p>
          <p className="text-sm text-gray-600">{musteri.phone} • {musteri.email}</p>
        </div>

        <table className="w-full mb-8 text-sm">
          <thead>
            <tr className="bg-green-700 text-white text-left">
              <th className="p-3 rounded-tl-md">Ürün / Hizmet Açıklaması</th>
              <th className="p-3 text-center">Miktar</th>
              <th className="p-3 text-right">Birim Fiyat</th>
              <th className="p-3 text-right rounded-tr-md">Toplam</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-200 last:border-0">
                <td className="p-3 font-medium">{item.name || '-'}</td>
                <td className="p-3 text-center">{item.qty}</td>
                <td className="p-3 text-right">{item.price.toFixed(2)} TL</td>
                <td className="p-3 text-right font-bold">{item.total.toFixed(2)} TL</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-10">
          <div className="w-64 bg-green-50 p-4 rounded-md border border-green-200">
            <div className="flex justify-between font-black text-xl text-green-800">
              <span>GENEL TOPLAM</span>
              <span data-testid="text-quote-total">{subTotal.toFixed(2)} TL</span>
            </div>
          </div>
        </div>

        {notes && (
          <div className="mt-auto pt-8 border-t border-gray-200">
            <h3 className="font-bold text-gray-500 uppercase text-xs mb-2">Notlar & Şartlar</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </div>

    </div>
  );
}
