"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, Beef, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    // Verificar sesión inicial
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      setLoading(false)
    }

    checkSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Menú", href: "/menu" },
    { name: "Promociones", href: "/promociones" },
    { name: "Ubicaciones", href: "/ubicaciones" },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/images/Logo_Torete.png" className="h-16 w-16 " />
              <span className="text-xl font-bold text-[#1F2937]">El Torete Burger</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[#1F2937] hover:text-primary transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
            {!loading && (
              <>
                {isLoggedIn ? (
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/protected">
                      <Settings className="h-4 w-4 mr-2" />
                      Panel Administrativo
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#1F2937] hover:text-primary">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-[#1F2937] hover:text-primary transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!loading && (
                <div className="px-3 py-2">
                  {isLoggedIn ? (
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                      <Link href="/protected" onClick={() => setIsOpen(false)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Panel Administrativo
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                      <Link href="/login" onClick={() => setIsOpen(false)}>Iniciar Sesión</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
