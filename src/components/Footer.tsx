import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-cta text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-accent">A</span>
              <span className="text-primary-foreground">M</span> Marine
            </h3>
            <p className="text-sm text-primary-foreground/80">
              Your trusted partner in marine and industrial automation equipment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products/automation" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="font-semibold mb-4">Product Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products/automation" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Automation
                </Link>
              </li>
              <li>
                <Link to="/products/electronics" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Electronics
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm text-primary-foreground/80">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>
                  Plot no.2104/6, Shishuvihar to ibrahim masjid road,<br />
                  Old TIN factory, Bhavnagar - 364001<br />
                  Gujarat - INDIA
                </span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-primary-foreground/80">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <a href="tel:+918866432914" className="hover:text-primary-foreground transition-colors">
                  +91 8866432914
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm text-primary-foreground/80">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <a href="mailto:a.m.marineautomation@gmail.com" className="hover:text-primary-foreground transition-colors">
                  a.m.marineautomation@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/80">
          <p>&copy; {new Date().getFullYear()} AM Marine & Automation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
