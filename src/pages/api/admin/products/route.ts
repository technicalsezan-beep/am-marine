import { NextRequest, NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'

const PRODUCTS_BLOB_KEY = 'data/products.json'

// Read products JSON from Vercel Blob
async function readProducts(): Promise<{ products: any[] }> {
  const { blobs } = await list({ prefix: PRODUCTS_BLOB_KEY, limit: 1 })
  if (!blobs.length) {
    return { products: [] }
  }
  const res = await fetch(blobs[0].url, { cache: 'no-store' })
  if (!res.ok) {
    return { products: [] }
  }
  return res.json()
}

// Write products JSON to Vercel Blob
async function writeProducts(data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  await put(PRODUCTS_BLOB_KEY, blob, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

// GET - Fetch all products
export async function GET() {
  try {
    const data = await readProducts()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading products:', error)
    return NextResponse.json({ products: [] })
  }
}

// POST - Add new product
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const category = formData.get('category') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const link = formData.get('link') as string
    const imageFile = formData.get('image') as File

    if (!category || !name || !description || !link || !imageFile) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Upload image to Vercel Blob
    const timestamp = Date.now()
    const filename = `${timestamp}-${imageFile.name.replace(/\s+/g, '-')}`
    const { url } = await put(`products/${filename}`, imageFile, {
      access: 'public',
      contentType: imageFile.type,
    })

    // Add product to database
    const data = await readProducts()
    const newProduct = {
      id: `${category}-${timestamp}`,
      category,
      name,
      description,
      link,
      image: url,
      createdAt: new Date().toISOString(),
    }

    data.products.push(newProduct)
    await writeProducts(data)

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Product added successfully',
    })
  } catch (error) {
    console.error('Error adding product:', error)
    return NextResponse.json(
      { error: 'Failed to add product' },
      { status: 500 }
    )
  }
}

// DELETE - Remove product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const data = await readProducts()
    const productIndex = data.products.findIndex((p: any) => p.id === id)

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const product = data.products[productIndex]

    // Delete image from Vercel Blob if it's a blob URL
    try {
      if (typeof product.image === 'string' && product.image.includes('vercel-storage.com')) {
        await del(product.image)
      }
    } catch (err) {
      console.error('Error deleting blob image:', err)
    }

    // Remove product from database
    data.products.splice(productIndex, 1)
    await writeProducts(data)

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
