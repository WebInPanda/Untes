import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const arialFontUrl = new URL("../assets/fonts/Arial.ttf", import.meta.url).href;
let arialFontBase64: string | null = null;
let arialFontLoadPromise: Promise<string | null> | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function loadArialFontBase64() {
  if (arialFontBase64) return arialFontBase64;
  if (!arialFontLoadPromise) {
    arialFontLoadPromise = fetch(arialFontUrl)
      .then((response) => response.ok ? response.arrayBuffer() : Promise.reject("Font yüklenemedi"))
      .then(arrayBufferToBase64)
      .then((base64) => {
        arialFontBase64 = base64;
        return base64;
      })
      .catch(() => null);
  }
  return arialFontLoadPromise;
}

async function ensureArialFont(doc: any) {
  if (typeof doc.addFileToVFS !== "function") return false;
  const base64 = await loadArialFontBase64();
  if (!base64) return false;
  try {
    doc.addFileToVFS("Arial.ttf", base64);
    doc.addFont("Arial.ttf", "Arial", "normal");
    doc.setFont("Arial", "normal");
    return true;
  } catch (e) {
    return false;
  }
}

function downloadDoc(doc: any, filename: string) {
  try {
    doc.save(filename);
  } catch (e) {
    try {
      if (typeof window !== 'undefined' && window.document) {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        doc.save(filename);
      }
    } catch (_) {
      /* noop */
    }
  }
}

export async function generateCustomerStatement(customerName: string, transactions: any[]) {
  const doc = new jsPDF();
  await ensureArialFont(doc);
  doc.text(`${customerName} - Hesap Ekstresi`, 14, 15);
  const body = (transactions || []).map((t: any) => [
    t && t.date ? new Date(t.date).toLocaleDateString() : '-',
    t && t.note ? t.note : '-',
    t && typeof t.amount === 'number' ? (t.amount > 0 ? 'Borç' : 'Alacak') : '-',
    t && typeof t.amount === 'number' ? `${Math.abs(t.amount)} TL` : '-'
  ]);
  autoTable(doc, {
    startY: 25,
    head: [['Tarih', 'Açıklama', 'Borç/Alacak', 'Tutar']],
    body,
  });
  const safeName = (customerName || 'musteri').replace(/[^a-z0-9_-]/gi, '_');
  downloadDoc(doc, `${safeName}_ekstre.pdf`);
}

export async function generateInvoice(customer: string, items: any[], total: number) {
  const doc = new jsPDF();
  await ensureArialFont(doc);
  doc.text(`Siparis Faturasi - ${customer}`, 14, 15);
  const safeItems = (items || []).map(i => ({
    name: i?.name ?? '-',
    qty: i?.qty ?? 0,
    price: i?.price ?? 0,
    subtotal: i?.subtotal ?? (i?.qty && i?.price ? i.qty * i.price : 0)
  }));
  autoTable(doc, {
    startY: 25,
    head: [['Urun', 'Miktar', 'Fiyat', 'Ara Toplam']],
    body: safeItems.map(i => [i.name, i.qty, `${i.price} TL`, `${i.subtotal} TL`]),
    foot: [['', '', 'Genel Toplam:', `${total} TL`]]
  });
  downloadDoc(doc, `fatura_${Date.now()}.pdf`);
}

export async function generateQuote(firma: any, musteri: any, items: any[], total: number, notes: string) {
  const doc = new jsPDF();
  await ensureArialFont(doc);
  doc.text("FIYAT TEKLIF FORMU", 105, 15, { align: "center" });
  autoTable(doc, {
    startY: 25,
    head: [['Firma', 'Musteri']],
    body: [[
      `${firma?.name ?? '-'}\n${firma?.phone ?? '-'}\n${firma?.email ?? '-'}\n${firma?.address ?? '-'}`,
      `${musteri?.name ?? '-'}\n${musteri?.phone ?? '-'}\n${musteri?.email ?? '-'}\n${musteri?.address ?? '-'}`
    ]]
  });
  const safeItems = (items || []).map(i => ({ name: i?.name ?? '-', qty: i?.qty ?? 0, price: i?.price ?? 0, total: i?.total ?? (i?.qty && i?.price ? i.qty * i.price : 0) }));
  autoTable(doc, {
    head: [['Urun', 'Miktar', 'Fiyat', 'Ara Toplam']],
    body: safeItems.map(i => [i.name, i.qty, `${i.price} TL`, `${i.total} TL`]),
    foot: [['', '', 'Genel Toplam:', `${total} TL`]]
  });
  const lastTable = (doc as any).lastAutoTable;
  const baseY = lastTable && lastTable.finalY ? lastTable.finalY : 25 + 10;
  if (notes) {
    doc.text("Notlar:", 14, baseY + 10);
    // wrap notes if long
    const lines = doc.splitTextToSize(notes, 180);
    doc.text(lines, 14, baseY + 16);
  }
  downloadDoc(doc, `teklif_${Date.now()}.pdf`);
}
