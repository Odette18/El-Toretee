
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, Car } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default async function UbicacionesPage() {
  const supabase = createClient()

  // Obtener ubicaciones activas
  const { data: ubicaciones } = await supabase.from("locations").select("*").eq("is_active", true).order("created_at")

  const getHours = (location: any) => {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

    return days.map((day, index) => ({
      day: dayNames[index],
      hours: location[`hours_${day}`] || "Cerrado",
    }))
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nuestras Ubicaciones</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Encuentra la sucursal más cercana a ti y disfruta de nuestras deliciosas hamburguesas
          </p>
        </div>
      </section>

      {/* Ubicaciones Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {ubicaciones?.map((ubicacion) => (
              <Card
                key={ubicacion.id}
                className="overflow-hidden hover:shadow-xl transition-shadow border-2 border-secondary/20"
              >
                <div className="aspect-video bg-gray-200">
                  <img
                    src={ubicacion.image_url || "/placeholder.svg?height=200&width=300"}
                    alt={ubicacion.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6 bg-secondary/5">
                  <h3 className="text-2xl font-bold text-[#1F2937] mb-4">{ubicacion.name}</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{ubicacion.address}</span>
                    </div>

                    {ubicacion.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-gray-600">{ubicacion.phone}</span>
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-gray-600">
                        <div className="text-sm font-medium mb-1">Horarios:</div>
                        {getHours(ubicacion).map((schedule, index) => (
                          <div key={index} className="text-xs flex justify-between">
                            <span>{schedule.day}:</span>
                            <span>{schedule.hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {ubicacion.features && ubicacion.features.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-[#1F2937] mb-2">Servicios disponibles:</h4>
                      <div className="flex flex-wrap gap-2">
                        {ubicacion.features.map((feature: string, featureIndex: number) => (
                          <span
                            key={featureIndex}
                            className="px-3 py-1 bg-secondary/20 text-secondary text-sm rounded-full font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button className="flex-1 bg-primary hover:bg-primary/90">
                      <MapPin className="h-4 w-4 mr-2" />
                      Ver en Mapa
                    </Button>
                    {ubicacion.phone && (
                      <Button
                        variant="outline"
                        className="flex-1 border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Llamar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-secondary/5 rounded-lg p-8 shadow-lg border-2 border-secondary/20">
            <Car className="h-16 w-16 text-secondary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-[#1F2937] mb-4">Servicio a Domicilio</h2>
            <p className="text-xl text-gray-600 mb-6">
              ¿No puedes visitarnos? No te preocupes, llevamos nuestras deliciosas hamburguesas hasta tu puerta
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="text-left">
                <h3 className="font-semibold text-[#1F2937] mb-2">Horarios de Delivery:</h3>
                <p className="text-gray-600">Lunes a Domingo: 12:00 PM - 10:00 PM</p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-[#1F2937] mb-2">Tiempo de entrega:</h3>
                <p className="text-gray-600">30-45 minutos aproximadamente</p>
              </div>
            </div>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Ordenar Ahora
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
