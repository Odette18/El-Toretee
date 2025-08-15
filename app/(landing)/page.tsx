import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Users, Clock, Beef } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default async function LandingPage() {
  const supabase = await createClient()

  // Obtener datos de la base de datos
  const [{ data: featuredItems }, { data: testimonials }, { data: teamMembers }, { data: siteSettings }] =
    await Promise.all([
      supabase.from("menu_items").select("*").eq("is_featured", true).order("display_order"),
      supabase.from("testimonials").select("*").eq("is_featured", true).order("created_at", { ascending: false }),
      supabase.from("team_members").select("*").eq("is_active", true).order("display_order"),
      supabase.from("site_settings").select("*"),
    ])

  // Convertir configuraciones a objeto
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
              <Link href="/landing/menu">Ver Menú</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              
            >
            <Button asChild size="lg" className="bg-lime-300 text-black hover:bg-secondary/90 font-bold">
              <Link href="/landing/ubicaciones" >Nuestras Ubicaciones</Link>
            </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-3  gap-12">
            {featuredItems?.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-secondary/20 "
              >
                <div className="aspect-video bg-gray-200">
                  <img
                    src={item.image_url || "/public/images/hamburguesa-torete.png"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4 text-primary-foreground">
                  <h3 className="text-xl font-bold text-[#1F2937] mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">${item.price}</span>
                   
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
            {teamMembers?.map((member) => (
              <div key={member.id} className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-secondary/20 border-4 border-secondary">
                  <img
                    src={member.image_url || "/placeholder.svg?height=150&width=150"}
                    alt={member.name}
                    className="w-full h-full object-cover"
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
                "Crear momentos únicos a través de hamburguesas excepcionales, brindando siempre la mejor calidad y un
                servicio que supere las expectativas de nuestros clientes."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">Lo Que Dicen Nuestros Clientes</h2>
            <p className="text-xl text-gray-600">
              Testimonios reales de personas que han disfrutado nuestras hamburguesas
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials?.map((testimonial) => (
              <Card key={testimonial.id} className="p-6 border-2 border-secondary/20">
                <CardContent className="p-0">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-secondary fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                  <p className="font-semibold text-[#1F2937]">- {testimonial.customer_name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  )
}