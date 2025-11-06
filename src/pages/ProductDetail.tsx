import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

// Sample product data - in a real app, this would come from a database
const productData: Record<string, any> = {
  "plc-001": {
    name: "Siemens S7-1200 PLC",
    partNumber: "6ES7214-1AG40-0XB0",
    manufacturer: "Siemens",
    category: "PLC",
    description: "Compact CPU with integrated I/O, ideal for small to medium automation tasks in machine and plant construction.",
    specifications: [
      { name: "Processor Speed", value: "50 MHz" },
      { name: "Work Memory", value: "75 KB" },
      { name: "Load Memory", value: "4 MB" },
      { name: "Digital Inputs", value: "14" },
      { name: "Digital Outputs", value: "10" },
      { name: "Analog Inputs", value: "2" },
      { name: "Communication Ports", value: "1x Ethernet" },
      { name: "Operating Temperature", value: "0°C to 55°C" }
    ],
    images: ["/placeholder.svg"]
  }
};

const ProductDetail = () => {
  const { id } = useParams();
  const product = productData[id || "plc-001"] || productData["plc-001"];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Breadcrumb Navigation */}
      <section className="py-4 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to="/products/automation" className="hover:text-primary">Products</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to="/products/automation" className="hover:text-primary">Automation</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground">{product.category}</span>
          </div>
        </div>
      </section>

      {/* Main Product Content */}
      <section className="py-12 flex-grow">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Left Column - Images */}
            <div>
              <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img: string, idx: number) => (
                  <div key={idx} className="aspect-square bg-muted rounded-lg cursor-pointer hover:ring-2 ring-primary">
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div>
              <h1 className="text-4xl font-bold mb-4 text-foreground">{product.name}</h1>
              <div className="space-y-2 mb-6">
                <p className="text-lg">
                  <span className="text-muted-foreground">Part Number:</span>{" "}
                  <span className="font-semibold text-foreground">{product.partNumber}</span>
                </p>
                <p className="text-lg">
                  <span className="text-muted-foreground">Manufacturer:</span>{" "}
                  <span className="font-semibold text-foreground">{product.manufacturer}</span>
                </p>
                <p className="text-lg">
                  <span className="text-muted-foreground">Category:</span>{" "}
                  <span className="font-semibold text-foreground">{product.category}</span>
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-foreground">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              <div className="space-y-4">
                <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link to="/contact">Request a Quote for this Product</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link to="/contact">Contact Technical Support</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Technical Specifications Section */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Technical Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between py-3 border-b border-border last:border-0"
                  >
                    <span className="font-semibold text-foreground">{spec.name}</span>
                    <span className="text-muted-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;
