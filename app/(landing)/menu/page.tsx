// app/landing/menu/page.tsx  (o src/app/landing/menu/page.tsx)

export const dynamic = "force-dynamic";   // ✅ evita que se sirva estático en prod
export const revalidate = 0;              // ✅ sin ISR

import { unstable_noStore as noStore } from "next/cache";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function MenuPage() {
  noStore(); // ✅ desactiva caché en este render

  const supabase = await createClient();

  // Categorías activas
  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (catErr) {
    console.error("Error categories:", catErr);
  }

  // Items disponibles + relación de categoría (slug para agrupar)
  const { data: menuItems, error: itemsErr } = await supabase
    .from("menu_items")
    .select(`
      *,
      categories (
        name,
        slug
      )
    `)
    .eq("is_available", true)
    .order("display_order");

  if (itemsErr) {
    console.error("Error menu_items:", itemsErr);
  }

  // Agrupar items por slug de categoría
  const itemsByCategory =
    menuItems?.reduce((acc: Record<string, any[]>, item: any) => {
      const categorySlug = item?.categories?.slug || "otros";
      if (!acc[categorySlug]) acc[categorySlug] = [];
      acc[categorySlug].push(item);
      return acc;
    }, {}) || {};

  const renderMenuItems = (items: typeof menuItems) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items?.map((item: any) => (
        <Card
          key={item.id}
          className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-secondary/20 flex flex-col h-full"
        >
          {/* Marco fijo para imágenes uniformes */}
          <div className="w-full aspect-[4/3] bg-white overflow-hidden">
            <img
              src={item.image_url || "/images/hamburguesa-torete.png"}
              alt={item.name}
              className="w-full h-full object-contain p-4"
              loading="lazy"
            />
          </div>

          <CardContent className="p-4 sm:p-6 bg-secondary/5 flex flex-col flex-1 justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1F2937] mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>

              {Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
                <p className="text-sm text-gray-500 mb-3">
                  <strong>Ingredientes:</strong> {item.ingredients.join(", ")}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lg sm:text-2xl font-bold text-primary">${item.price}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const firstTab = categories?.[0]?.slug || Object.keys(itemsByCategory)[0] || "otros";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative text-white py-16 sm:py-20 min-h-[300px] sm:min-h-[400px] flex items-center"
        style={{
          backgroundImage: "url('/images/hero-burgers.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Nuestro Menú</h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto">
            Descubre todas nuestras deliciosas hamburguesas y acompañamientos preparados con ingredientes frescos
          </p>
        </div>
      </section>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue={firstTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 mb-8">
              {/* Tabs de categorías activas */}
              {categories?.map((category) => (
                <TabsTrigger key={category.id} value={category.slug} className="truncate">
                  {category.name}
                </TabsTrigger>
              ))}

              {/* Si hay items con categoría “otros” */}
              {itemsByCategory["otros"] && !categories?.some(c => c.slug === "otros") && (
                <TabsTrigger value="otros" className="truncate">Otros</TabsTrigger>
              )}
            </TabsList>

            {/* Contenido por categoría */}
            {categories?.map((category) => (
              <TabsContent key={category.id} value={category.slug} className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] mb-6">{category.name}</h2>
                {renderMenuItems(itemsByCategory[category.slug] || [])}
              </TabsContent>
            ))}

            {/* Tab “Otros” si aplica */}
            {itemsByCategory["otros"] && (
              <TabsContent value="otros" className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] mb-6">Otros</h2>
                {renderMenuItems(itemsByCategory["otros"])}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
