import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

// Sample product data
const sampleProducts = {
  automation: [
    {
      id: "plc-001",
      name: "Siemens S7-1200 PLC",
      partNumber: "6ES7214-1AG40-0XB0",
      manufacturer: "Siemens",
      category: "PLC",
      image: "/placeholder.svg"
    },
    {
      id: "hmi-001",
      name: "Siemens HMI Basic Panel",
      partNumber: "6AV2123-2GB03-0AX0",
      manufacturer: "Siemens",
      category: "HMI",
      image: "/placeholder.svg"
    },
    {
      id: "servo-001",
      name: "ABB Servo Drive",
      partNumber: "3HAC028357-001",
      manufacturer: "ABB",
      category: "Servo Drive",
      image: "/placeholder.svg"
    },
    {
      id: "io-001",
      name: "Schneider I/O Module",
      partNumber: "TM3DI8",
      manufacturer: "Schneider Electric",
      category: "I/O Module",
      image: "/placeholder.svg"
    }
  ],
  electronics: [
    {
      id: "acb-001",
      name: "ABB Air Circuit Breaker",
      partNumber: "E2B-1600",
      manufacturer: "ABB",
      category: "ACB",
      image: "/placeholder.svg"
    },
    {
      id: "mccb-001",
      name: "Schneider MCCB",
      partNumber: "NSX250F",
      manufacturer: "Schneider Electric",
      category: "MCCB",
      image: "/placeholder.svg"
    },
    {
      id: "contactor-001",
      name: "Siemens Contactor",
      partNumber: "3RT2026-1AP00",
      manufacturer: "Siemens",
      category: "Contactor",
      image: "/placeholder.svg"
    },
    {
      id: "relay-001",
      name: "ABB Overload Relay",
      partNumber: "TA25DU-1.6",
      manufacturer: "ABB",
      category: "Overload Relay",
      image: "/placeholder.svg"
    }
  ]
};

const Products = () => {
  const { category } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  const products = category === "electronics" ? sampleProducts.electronics : sampleProducts.automation;
  const categoryTitle = category === "electronics" ? "Electronics & Switch Gears" : "Marine & Industrial Automation";

  const manufacturers = Array.from(new Set(products.map(p => p.manufacturer)));
  const subcategories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesManufacturer = !selectedManufacturer || product.manufacturer === selectedManufacturer;
    const matchesSubcategory = !selectedSubcategory || product.category === selectedSubcategory;
    return matchesSearch && matchesManufacturer && matchesSubcategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Page Header */}
      <section className="py-12 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">{categoryTitle}</h1>
          <p className="text-xl text-primary-foreground/90">
            Browse our comprehensive range of high-quality products
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-grow">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Filter Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-foreground">Filters</h3>
                  
                  {/* Search by Part Number */}
                  <div className="mb-6">
                    <Label htmlFor="search">Search by Part Number</Label>
                    <div className="relative mt-2">
                      <Input
                        id="search"
                        placeholder="Enter part number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Filter by Manufacturer */}
                  <div className="mb-6">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <select
                      id="manufacturer"
                      className="w-full mt-2 p-2 border border-input rounded-md bg-background"
                      value={selectedManufacturer}
                      onChange={(e) => setSelectedManufacturer(e.target.value)}
                    >
                      <option value="">All Manufacturers</option>
                      {manufacturers.map(mfr => (
                        <option key={mfr} value={mfr}>{mfr}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter by Subcategory */}
                  <div className="mb-6">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <select
                      id="subcategory"
                      className="w-full mt-2 p-2 border border-input rounded-md bg-background"
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {subcategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedManufacturer("");
                      setSelectedSubcategory("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Product Grid */}
            <div className="md:col-span-3">
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Showing {filteredProducts.length} products
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        Part #: {product.partNumber}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {product.manufacturer}
                      </p>
                      <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link to={`/product/${product.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No products found matching your filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Products;
