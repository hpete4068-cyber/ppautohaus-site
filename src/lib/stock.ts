// Stock data layer. Source of truth: a Google Sheet published as CSV (STOCK_CSV_URL).
// Columns: id,status,year,make,model,variant,price,km,colour,transmission,body,description,photos,features
// photos and features are pipe-separated ("a.jpg|b.jpg"). price is a number or "POA".
// Without STOCK_CSV_URL, or if the fetch fails, the SAMPLE JSON is used and every car gets isSample = true.
import sample from '../data/stock.sample.json';

export type Status = 'available' | 'under offer' | 'sold';
export interface Car {
  id: string; status: Status; year: string; make: string; model: string; variant: string;
  price: string; km: string; colour: string; transmission: string; body: string;
  description: string; photos: string[]; features: string[]; isSample: boolean;
}
const COLS = ['id','status','year','make','model','variant','price','km','colour','transmission','body','description','photos','features'];

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let f = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i+1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i+1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}

function normalise(r: Record<string,string>, isSample: boolean): Car {
  const split = (s = '') => s.split('|').map(x => x.trim()).filter(Boolean);
  const st = (r.status || '').trim().toLowerCase();
  return {
    id: (r.id||'').trim(), status: (['available','under offer','sold'].includes(st) ? st : 'available') as Status,
    year: r.year||'', make: r.make||'', model: r.model||'', variant: r.variant||'',
    price: (r.price||'').trim() || 'POA', km: r.km||'', colour: r.colour||'', transmission: r.transmission||'',
    body: r.body||'', description: r.description||'', photos: split(r.photos), features: split(r.features), isSample,
  };
}

let cache: Car[] | null = null;
export async function getStock(): Promise<Car[]> {
  if (cache) return cache;
  const url = import.meta.env.STOCK_CSV_URL || process.env.STOCK_CSV_URL;
  if (url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const [head, ...rows] = parseCsv(await res.text());
      const keys = head.map(h => h.trim().toLowerCase());
      cache = rows.map(r => normalise(Object.fromEntries(keys.map((k,i) => [k, r[i] ?? ''])), false)).filter(c => c.id);
      return cache;
    } catch (e) { console.warn('[stock] CSV fetch failed, using SAMPLE data:', e); }
  }
  cache = (sample as Record<string,string>[]).map(r => normalise(r, true));
  return cache;
}
export const formatPrice = (p: string) => /^\d+(\.\d+)?$/.test(p.replace(/[,$\s]/g,'')) ? '$' + Number(p.replace(/[,$\s]/g,'')).toLocaleString('en-AU') : 'POA';
export const carTitle = (c: Car) => [c.year, c.make, c.model].filter(Boolean).join(' ');
export { COLS };
