"use client"

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { Button } from "./ui/button"
import Link from "next/link"
import {  Menu, X } from "lucide-react"
import { useState } from "react"
import Logo from "./Logo"
import { NAV_LINKS } from "@/constants"




const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-foreground hover:text-primary transition-colors"
          >
            <Logo/>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary px-3 py-2 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <SignedOut>
              {/* Hidden on very small screens, shown on sm+ */}
              <div className="hidden sm:flex items-center gap-2">
                <SignInButton >
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-medium cursor-pointer"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton >
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white font-medium cursor-pointer shadow-sm"
                  >
                    Get Started
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </nav>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary px-3 py-2 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {/* Auth buttons in mobile menu */}
            <SignedOut>
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border">
                <SignInButton >
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-primary hover:bg-primary/10 font-medium cursor-pointer"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton >
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium cursor-pointer"
                  >
                    Get Started
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
        )}
      </header>


      <div className="h-16" />
    </>
  )
}

export default Header