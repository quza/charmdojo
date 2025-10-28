'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-neutral-900 border-t border-neutral-800">
          <div className="px-6 py-4 space-y-4">
            <Link
              href="/about"
              className="block text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/articles"
              className="block text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Articles
            </Link>
            <Link
              href="/contact"
              className="block text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <Link
                href="/login"
                className="block text-primary font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Button
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10"
                asChild
              >
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

