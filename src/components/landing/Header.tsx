import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MobileMenu } from './MobileMenu';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800">
      <nav className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/logotype_transparent.png"
            alt="CharmDojo Logo"
            width={200}
            height={60}
            className="h-12 w-auto lg:h-14"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/about"
            className="text-white/80 hover:text-white transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/articles"
            className="text-white/80 hover:text-white transition-colors"
          >
            Articles
          </Link>
          <Link
            href="/contact"
            className="text-white/80 hover:text-white transition-colors"
          >
            Contact Us
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/login"
            className="text-primary hover:text-primary-light transition-colors font-medium"
          >
            Sign In
          </Link>
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary-light"
            asChild
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu - Client Component */}
        <MobileMenu />
      </nav>
    </header>
  );
}

