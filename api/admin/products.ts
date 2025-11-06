export const config = { runtime: 'edge' };

import { put, del, list } from '@vercel/blob';

const PRODUCTS_BLOB_KEY = 'data/products.json';

// Simple in-memory fallback for local dev when Blob is not configured
type ProductsData = { products: any[] };
const MEM_KEY = '__MEM_PRODUCTS__';
function getMem(): ProductsData {
  const g = globalThis as any;
  if (!g[MEM_KEY]) g[MEM_KEY] = { products: [] } as ProductsData;
  return g[MEM_KEY] as ProductsData;
}

async function readProducts(): Promise<{ products: any[] }> {
  try {
    const { blobs } = await list({ prefix: PRODUCTS_BLOB_KEY, limit: 1 });
    if (!blobs.length) return { products: [] };
    const res = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!res.ok) return { products: [] };
    return res.json();
  } catch {
    // Fallback for local dev without Blob
    return getMem();
  }
}

async function writeProducts(data: any) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    await put(PRODUCTS_BLOB_KEY, blob, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  } catch {
    // Fallback for local dev without Blob
    const mem = getMem();
    mem.products = Array.isArray(data?.products) ? [...data.products] : [];
  }
}

export default async function handler(request: Request): Promise<Response> {
  try {
    if (request.method === 'GET') {
      const data = await readProducts();
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method === 'POST') {
      const formData = await request.formData();
      const category = formData.get('category') as string;
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const link = formData.get('link') as string;
      const imageFile = formData.get('image') as File | null;

      if (!category || !name || !description || !link || !imageFile) {
        return new Response(JSON.stringify({ error: 'All fields are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const timestamp = Date.now();
      const filename = `${timestamp}-${(imageFile as File).name.replace(/\s+/g, '-')}`;

      async function toDataUrl(file: File): Promise<string> {
        const buf = await file.arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(buf);
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
        }
        const base64 = btoa(binary);
        return `data:${file.type};base64,${base64}`;
      }

      let url: string;
      try {
        const result = await put(`products/${filename}`, imageFile as File, {
          access: 'public',
          contentType: (imageFile as File).type,
        });
        url = result.url;
      } catch {
        // Local fallback: embed as data URL so UI still renders
        url = await toDataUrl(imageFile as File);
      }

      const data = await readProducts();
      const newProduct = {
        id: `${category}-${timestamp}`,
        category,
        name,
        description,
        link,
        image: url,
        createdAt: new Date().toISOString(),
      };

      data.products.push(newProduct);
      await writeProducts(data);

      return new Response(
        JSON.stringify({ success: true, product: newProduct, message: 'Product added successfully' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (request.method === 'DELETE') {
      const urlObj = new URL(request.url);
      const id = urlObj.searchParams.get('id');
      if (!id) {
        return new Response(JSON.stringify({ error: 'Product ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const data = await readProducts();
      const index = data.products.findIndex((p: any) => p.id === id);
      if (index === -1) {
        return new Response(JSON.stringify({ error: 'Product not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const product = data.products[index];
      try {
        if (typeof product.image === 'string' && product.image.includes('vercel-storage.com')) {
          await del(product.image);
        }
      } catch (err) {
        // non-fatal in local fallback
      }

      data.products.splice(index, 1);
      await writeProducts(data);

      return new Response(JSON.stringify({ success: true, message: 'Product deleted successfully' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
