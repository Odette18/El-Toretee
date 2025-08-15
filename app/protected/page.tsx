import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Menu, Tag, MapPin } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/lib/supabase/server"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Estadísticas desde Supabase (y mock para users por ahora)
  const [
    { count: totalMenuItems },
    { count: activePromotions }, 
    { count: activeLocations },
    { count: totalUsers },
    { data: menuItems },
    { data: recentPromotions },
  ] = await Promise.all([
    supabase.from("menu_items").select("*", { count: "exact", head: true }),
    supabase.from("promotions").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("locations").select("*", { count: "exact", head: true }).eq("is_active", true),
    // Temporal: mock users hasta tener tabla profiles
    Promise.resolve({ count: 1 }),
    supabase
      .from("menu_items")
      .select("name, is_available")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("promotions")
      .select("title, is_active, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
  ])

  const availableItems = (menuItems?.filter((i) => i.is_available).length) ?? 0

  const stats = [
    { title: "Platos en Menú", value: String(totalMenuItems ?? 0), change: `${availableItems} disponibles`, icon: Menu, color: "text-purple-600" },
    { title: "Promociones Activas", value: String(activePromotions ?? 0), change: "en curso", icon: Tag, color: "text-orange-600" },
    { title: "Ubicaciones Activas", value: String(activeLocations ?? 0), change: "funcionando", icon: MapPin, color: "text-blue-600" },
    { title: "Usuarios del Sistema", value: String(totalUsers ?? 0), change: "registrados", icon: Users, color: "text-green-600" },
  ]

  const quickActions = [
    { title: "Gestionar Menú", description: "Agregar, editar o eliminar platos del menú", href: "/protected/menu", icon: Menu, color: "bg-primary" },
    { title: "Promociones", description: "Crear y gestionar ofertas especiales", href: "/protected/promociones", icon: Tag, color: "bg-secondary" },
    { title: "Ubicaciones", description: "Administrar sucursales y ubicaciones", href: "/protected/ubicaciones", icon: MapPin, color: "bg-[#1F2937]" },
    { title: "Usuarios", description: "Gestionar cuentas de administradores", href: "/protected/usuarios", icon: Users, color: "bg-green-600" },
  ]

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        {/* responsive: contenedor central con paddings por breakpoint */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* responsive: toolbar flexible y con wrap */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">
              Panel de Administración — El Torete Burger
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/">Ver Sitio Web</Link>
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid: 1 col en móvil, 2 en md, 4 en lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-[#1F2937]">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions: grid adaptable */}
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#1F2937] mb-4 sm:mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <Link href={action.href} className="block">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Content Overview: 1 col en móvil, 2 en lg */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Menu Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Menu className="h-5 w-5 mr-2 text-purple-600" />
                Últimos Platos del Menú
              </CardTitle>
              <CardDescription>Platos agregados recientemente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {menuItems?.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium truncate pr-3">{item.name}</p>
                    <div
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.is_available ? "Disponible" : "No disponible"}
                    </div>
                  </div>
                ))}
                {(!menuItems || menuItems.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay platos en el menú
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Promotions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2 text-orange-600" />
                Promociones Recientes
              </CardTitle>
              <CardDescription>Últimas promociones creadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPromotions?.map((promo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-medium truncate">{promo.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(promo.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs ${
                        promo.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {promo.is_active ? "Activa" : "Inactiva"}
                    </div>
                  </div>
                ))}
                {(!recentPromotions || recentPromotions.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay promociones creadas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
