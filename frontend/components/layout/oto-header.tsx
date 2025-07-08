"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import "@/styles/scroll.css"
import {usePrivy} from '@privy-io/react-auth';
import { apiService } from "@/lib/api-service"

const navItems = [
  { href: "/upload", label: "Upload" },
  { href: "/profile", label: "Profile" },
  { href: "/analytics", label: "Analytics" },
  { href: "/whats-oto", label: "What's oto" },
]

export default function OtoHeader() {
  const {login, logout, ready, authenticated, user, getAccessToken} = usePrivy();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (authenticated) {
      apiService.setUserId(user!.id);
      apiService.setTokenRefresherFn(async () => {
        const token = await getAccessToken();
        if (token) {
          return token;
        }
        return "";
      });
    }
  }, [authenticated, user]);

  const buttonClick = () => {
    if (authenticated) {
      logout();
    } else {
      login();
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile hamburger menu */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                <span className={cn(
                  "block h-0.5 w-5 bg-neutral-600 transition-all duration-300",
                  isMobileMenuOpen && "rotate-45 translate-y-1.5"
                )}></span>
                <span className={cn(
                  "block h-0.5 w-5 bg-neutral-600 transition-all duration-300",
                  isMobileMenuOpen && "opacity-0"
                )}></span>
                <span className={cn(
                  "block h-0.5 w-5 bg-neutral-600 transition-all duration-300",
                  isMobileMenuOpen && "-rotate-45 -translate-y-1.5"
                )}></span>
              </div>
            </button>
          </div>

          {/* Desktop navigation - hidden on mobile */}
          <div className="hidden md:flex flex-1">{/* Spacer */}</div>
          <nav className="hidden md:flex flex-1 justify-center items-center space-x-6 text-sm text-neutral-600">
            {navItems.map((item, index) => (
              <React.Fragment key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "hover:text-neutral-900 transition-colors",
                    item.label === "What's oto" && "whitespace-nowrap",
                  )}
                >
                  {item.label}
                </Link>
                {index < navItems.length - 1 && <span className="text-neutral-300">&middot;</span>}
              </React.Fragment>
            ))}
          </nav>
          <div className="hidden md:flex flex-1 justify-end">
            <Button
              variant="default"
              className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs px-3 py-1.5 h-auto rounded-full"
              onClick={buttonClick}
            >
              {ready ? (authenticated ? user?.wallet?.address.slice(0, 6) + "..." + user?.wallet?.address.slice(-4) : "Connect Wallet") : "Connect Wallet"}
            </Button>
          </div>

          {/* Mobile connect wallet button */}
          <div className="md:hidden">
            <Button
              variant="default"
              className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs px-3 py-1.5 h-auto rounded-full"
              onClick={buttonClick}
            >
              {ready ? (authenticated ? user?.wallet?.address.slice(0, 4) + "..." + user?.wallet?.address.slice(-2) : "Connect") : "Connect"}
            </Button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-neutral-200",
          isMobileMenuOpen 
            ? "max-h-96 opacity-100 mt-4" 
            : "max-h-0 opacity-0 mt-0"
        )}>
          <nav className={cn(
            "flex flex-col space-y-3 px-2 transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "pt-4 pb-4 translate-y-0" : "pt-0 pb-0 -translate-y-2"
          )}>
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-neutral-600 hover:text-neutral-900 transition-all duration-200 py-2 text-sm rounded-md hover:bg-neutral-50 px-2",
                  isMobileMenuOpen 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-1"
                )}
                style={{
                  transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms'
                }}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}