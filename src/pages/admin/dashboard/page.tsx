"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut, Upload, Trash2, Plus } from "lucide-react"

interface Product {
  id: string
  category: string
  name: string
  description: string
  image?: string // backward compat
  images?: string[]
  link: string
  partNumber?: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("automation")
  
  // Form state
  const [formData, setFormData] = useState({
    category: "automation",
    name: "",
    description: "",
    partNumber: "",
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken")
    if (!token) {
      navigate("/admin")
      return
    }
    
    fetchProducts()
  }, [navigate])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    navigate("/admin")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImageFiles(files)
    if (files.length) {
      Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.readAsDataURL(file)
            })
        )
      ).then((previews) => setImagePreviews(previews))
    } else {
      setImagePreviews([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("category", formData.category)
      formDataToSend.append("name", formData.name)
      formDataToSend.append("partNumber", formData.partNumber)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("link", getCategoryLink(formData.category))
      imageFiles.forEach((file) => formDataToSend.append("images", file))
      if (imageFiles[0]) {
        formDataToSend.append("image", imageFiles[0])
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Product added successfully!' })
        setFormData({ category: "automation", name: "", description: "", partNumber: "" })
        setImageFiles([])
        setImagePreviews([])
        fetchProducts()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add product' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add product' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Product deleted successfully!' })
        fetchProducts()
      } else {
        setMessage({ type: 'error', text: 'Failed to delete product' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete product' })
    }
  }

  const categories = [
    { value: "automation", label: "Automation", link: "/products/automation" },
    { value: "electronic", label: "Electronic", link: "/products/electronic" },
  ]

  // Get link based on category
  const getCategoryLink = (category: string) => {
    return categories.find(c => c.value === category)?.link || ""
  }

  const filteredProducts = products.filter(p => p.category === activeTab)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout} className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add Product Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partNumber">Part Number</Label>
                  <Input
                    id="partNumber"
                    value={formData.partNumber}
                    onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                    placeholder="Enter part number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2 p-3 bg-muted rounded-md">
                  <Label className="text-sm text-muted-foreground">Auto-Generated Link</Label>
                  <p className="text-sm font-mono">{getCategoryLink(formData.category)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Product Images</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    required
                  />
                  {imagePreviews.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative w-full h-24 rounded-md overflow-hidden border">
                          <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={isSubmitting}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Adding..." : "Add Product"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Products List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Manage Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-6">
                  {categories.map((cat) => (
                    <TabsTrigger key={cat.value} value={cat.value}>
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((cat) => (
                  <TabsContent key={cat.value} value={cat.value}>
                    <div className="space-y-4">
                      {filteredProducts.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No products in this category yet.
                        </p>
                      ) : (
                        filteredProducts.map((product) => (
                          <Card key={product.id}>
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                                  <img
                                    src={(product.images && product.images[0]) || product.image || ""}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold mb-1">{product.name}</h3>
                                  {product.partNumber && (
                                    <p className="text-xs text-muted-foreground mb-1">Part No: {product.partNumber}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {product.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Link: {product.link}
                                  </p>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
