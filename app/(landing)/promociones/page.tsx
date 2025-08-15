
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Percent, Gift } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default async function PromocionesPage() {
  const supabase = createClient()

  // Obtener promociones activas
  const { data: promociones } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  const getIcon = (type: string) => {
    switch (type) {
      case "weekly":
        return <Clock className="h-5 w-5" />
      case "combo":
        return <Gift className="h-5 w-5" />
      case "happy-hour":
        return <Clock className="h-5 w-5" />
      default:
        return <Percent className="h-5 w-5" />
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "weekly":
        return "bg-primary"
      case "combo":
        return "bg-secondary"
      case "happy-hour":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Permanente"
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section
        className="relative text-white py-20 min-h-[400px] flex items-center"
        style={{
          backgroundImage: "url('/images/hero-burgers.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Promociones Especiales</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Aprovecha nuestras increíbles ofertas y disfruta de las mejores hamburguesas a precios únicos
          </p>
        </div>
      </section>

      {/* Promociones Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6x1 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {promociones?.map((promo) => (
              <Card
                key={promo.id}
                className="overflow-hidden hover:shadow-xl transition-shadow border-2 border-secondary/20"
              >
                <div className="relative">
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={promo.image_url || "/placeholder.svg?height=200&width=300"}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Badge
                    className={`absolute top-4 right-4 ${getBadgeColor(promo.promo_category || "default")} text-white`}
                  >
                    {getIcon(promo.promo_category || "default")}
                    <span className="ml-1">{promo.discount_percentage}% OFF</span>
                  </Badge>
                </div>
                <CardContent className="p-6 bg-secondary/5">
                  <h3 className="text-2xl font-bold text-[#1F2937] mb-3">{promo.title}</h3>
                  <p className="text-gray-600 mb-4">{promo.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Válido hasta: {formatDate(promo.end_date)}
                    </span>
                  </div>
                  {promo.terms_conditions && (
                    <p className="text-xs text-gray-500 mb-4 italic">{promo.terms_conditions}</p>
                  )}
                  <Button className="w-full bg-primary hover:bg-primary/90">Aprovechar Oferta</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#1F2937] mb-4">¿No quieres perderte nuestras promociones?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Suscríbete a nuestro boletín y recibe las mejores ofertas directamente en tu email
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Tu email aquí"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-secondary hover:bg-secondary/90">Suscribirse</Button>
          </div>
        </div>
      </section> */}
    </div>
  )
}
