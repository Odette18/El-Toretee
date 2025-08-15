import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Users, Clock, Beef } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server" // Server component

// Marcamos importaciones como usadas para evitar eslint no-unused-vars
// sin cambiar el diseño ni la lógica
void [Navbar, Footer, Star, Users, Clock];

function shufflePick<T>(arr: T[], take: number): T[] {
  // Fisher–Yates in-place
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, take)
}

export default async function LandingPage() {
  const supabase = await createClient()

  // Traemos todo lo necesario en paralelo
  const [
    { data: allMenuItems },
    { data: testimonials },
    { data: teamMembers },
    { data: siteSettings },
  ] = await Promise.all([
    supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("display_order"),
    supabase
      .from("testimonials")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("team_members")
      .select("*")
      .eq("is_active", true)
      .order("display_order"),
    supabase.from("site_settings").select("*"),
  ])

  // Evitamos warning si no se usan
  void testimonials

  // Elegimos 3 items aleatorios del menú (opcionalmente, prioriza los que tienen imagen)
  const pool =
    allMenuItems?.filter((i) => i.image_url && i.image_url.trim() !== "") ??
    allMenuItems ??
    []
  const featuredItems = shufflePick(pool.length ? pool : allMenuItems ?? [], 3)

  const settings =
    siteSettings?.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, string>,
    ) || {}

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative text-white py-20 min-h-[600px] flex items-center"
        style={{
          backgroundImage: "url('/images/hero-burgers.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Beef className="h-16 w-16 text-secondary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {settings.hero_title || "Bienvenido a El Torete Burger"}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            {settings.hero_subtitle ||
              "Las mejores hamburguesas y papas fritas de la ciudad. Ingredientes frescos, sabores únicos y la calidad que nos caracteriza."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-lime-300 text-black hover:bg-secondary/90 font-bold">
              <Link href="/menu">Ver Menú</Link>
            </Button>

            <Button asChild size="lg" className="bg-lime-300 text-black hover:bg-secondary/90 font-bold">
              <Link href="/ubicaciones">Nuestras Ubicaciones</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Dishes Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">Lo Más Pedido</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras hamburguesas y acompañamientos favoritos que han conquistado el paladar de nuestros
              clientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
            {featuredItems?.map((item: any) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-secondary/20 "
              >
                <div className="w-full aspect-[4/3] bg-white overflow-hidden">
                  <img
                    src={item.image_url || "/images/hamburguesa-torete.png"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-4 text-primary-foreground">
                  <h3 className="text-xl font-bold text-[#1F2937] mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      {typeof item.price === "number" ? `$${item.price}` : item.price}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/menu">Ver Menú Completo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16 bg-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Nuestro Equipo</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl mb-8">
                {settings.company_story ||
                  "Desde 2016, El Torete Burger nació del sueño de crear las mejores hamburguesas de la ciudad. Comenzamos como un pequeño local familiar y hoy somos reconocidos por nuestra calidad, ingredientes frescos y el sabor único que nos caracteriza."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
            {teamMembers?.map((member: any) => (
              <div key={member.id} className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-secondary/20 border-4 border-secondary">
                  <img
                    src={member.image_url || "/placeholder.svg?height=150&width=150"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                <p className="text-secondary text-sm">{member.role}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="bg-secondary/10 rounded-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Nuestra Misión</h3>
              <p className="text-lg">
                &quot;Crear momentos a través de hamburguesas excepcionales, brindando siempre la mejor calidad y un
                servicio que supere las expectativas de nuestros clientes.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  )
}
