import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Leaf } from 'lucide-react';
import logo from '@/assets/logo.jpeg';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img
                src={logo}
                alt="NilgirisFresh"
                className="h-14 w-auto rounded-full"
              />
            </Link>
            <p className="text-sm opacity-90 leading-relaxed mb-4">
              Premium tea sourced directly from the lush estates of Gudalur,
              Nilgiris. Supporting local farmers since day one.
            </p>

            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg w-fit">
              <img
                src="/fssai-logo.png"
                alt="FSSAI Certified"
                className="h-8 w-auto bg-white rounded p-0.5"
              />
              <div className="flex flex-col">
                <span className="text-[10px] opacity-80 uppercase tracking-wider">Lic. No.</span>
                <span className="text-xs font-mono font-bold tracking-wide">12425997000699</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2">
              {[
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/about' },
                { name: 'Products', path: '/products' },
                { name: 'FAQ', path: '/faq' },
                { name: 'Contact', path: '/contact' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Business */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">For Business</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/bulk-enquiry" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Bulk Orders
              </Link>
              <Link to="/bulk-enquiry" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Dealer Enquiry
              </Link>
              <Link to="/contact" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Partnership
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+919025003946"
                className="flex items-start gap-3 text-sm opacity-80 hover:opacity-100 transition-opacity"
              >
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                +91 63698 12070
              </a>
              <a
                href="mailto:vineshvts098@gmail.com"
                className="flex items-start gap-3 text-sm opacity-80 hover:opacity-100 transition-opacity"
              >
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                vineshvts098@gmail.com
              </a>
              <div className="flex items-start gap-3 text-sm opacity-80">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Gudalur, Nilgiris District,<br />Tamil Nadu, India - 643212</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-70">
              © 2026 NilgirisFresh. All rights reserved.
            </p>
            <p className="text-sm opacity-70">
              Made with ❤️ from the Nilgiri Hills
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}