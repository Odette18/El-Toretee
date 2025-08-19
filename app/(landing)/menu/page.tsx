// app/(landing)/menu/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

// TIPOS (ajústalos si tu tabla tiene más/menos columnas)
type Category = {
  id: string;
  name: string;
  slug: string;
  display_order?: number | null;
  is_active?: boolean | null;
};

type ItemCategoryRel = {
  name: string | null;
  slug: string | null;
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  ingredients: string[] | null;
  display_order?: number | null;
  is_available?: boolean | null;
  categories: ItemCategoryRel | null;
};

export default async function MenuPage() {
  noStore();

  const supabase = await createClient();

  // Categorías activas
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  // Items disponibles + relación de categoría
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select(
      `
      id, name, description, price, image_url, ingredients, display_order, is_available,
      categories ( name, slug )
    `
    )
    .eq("is_available", true)
    .order("display_order");

  // Agrupar items por slug de categoría
  const itemsByCategory: Record<string, MenuItem[]> =
    (menuItems as MenuItem[] | null)?.reduce((acc: Record<string, MenuItem[]>, item: MenuItem) => {
      const slug = item.categories?.slug ?? "otros";
      if (!acc[slug]) acc[slug] = [];
      acc[slug].push(item);
      return acc;
    }, {}) ?? {};

  const renderMenuItems = (items: MenuItem[] | undefined) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {(items ?? []).map((item) => (
        <Card
          key={item.id}
          className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-secondary/20 flex flex-col h-full"
        >
          {/* Marco fijo para imágenes uniformes */}
          <div className="relative w-full aspect-[4/3] bg-white">
            <Image
              src={item.image_url || "/images/hamburguesa-torete.png"}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-4"
              priority={false}
            />
          </div>

          <CardContent className="p-4 sm:p-6 bg-secondary/5 flex flex-col flex-1 justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1F2937] mb-2">{item.name}</h3>
              {item.description ? <p className="text-gray-600 mb-4">{item.description}</p> : null}

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

  const firstTab =
    categories?.[0]?.slug || Object.keys(itemsByCategory)[0] || "otros";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative text-white py-16 sm:py-20 min-h-[300px] sm:min-h-[400px] flex items-center"
        style={{
          backgroundImage: "url('/images/hero-burgers.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
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
              {categories?.map((category: Category) => (
                <TabsTrigger key={category.id} value={category.slug} className="truncate">
                  {category.name}
                </TabsTrigger>
              ))}
              {itemsByCategory["otros"] &&
                !categories?.some((c) => c.slug === "otros") && (
                  <TabsTrigger value="otros" className="truncate">
                    Otros
                  </TabsTrigger>
                )}
            </TabsList>

            {categories?.map((category: Category) => (
              <TabsContent key={category.id} value={category.slug} className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] mb-6">{category.name}</h2>
                {renderMenuItems(itemsByCategory[category.slug])}
              </TabsContent>
            ))}

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
