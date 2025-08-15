"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category_id: string
  is_available: boolean
  image_url?: string
  categories?: {
    id: string
    name: string
    slug: string
  }
}

type Category = {
  id: string
  name: string
  slug: string
  is_active: boolean
}

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    price: "",
    description: "",
    image_url: "", // dejamos el campo porque la BD lo usa, pero ahora lo llenamos automáticamente
  })
  const [imageFile, setImageFile] = useState<File | null>(null) // ← NUEVO

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [{ data: menuData }, { data: categoriesData }] = await Promise.all([
        supabase
          .from("menu_items")
          .select(`
            *,
            categories (
              id,
              name,
              slug
            )
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order")
      ])

      if (menuData) setMenuItems(menuData)
      if (categoriesData) setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  // --- NUEVO: carga la imagen si se seleccionó y devuelve su URL pública
  const uploadImageIfNeeded = async (): Promise<string | undefined> => {
    if (!imageFile) return editingItem?.image_url || undefined

    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `platos/${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from("menu_images") // bucket
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type || "image/*",
      })

    if (uploadError) {
      console.error(uploadError)
      throw new Error("No se pudo subir la imagen")
    }

    const { data: pub } = supabase.storage.from("menu_images").getPublicUrl(data.path)
    return pub.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // si hay archivo, lo subimos y usamos su URL pública
      const publicUrl = await uploadImageIfNeeded()

      const itemData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category_id: formData.category_id,
        image_url: publicUrl || undefined,
      }

      if (editingItem) {
        const { data, error } = await supabase
          .from("menu_items")
          .update(itemData)
          .eq("id", editingItem.id)
          .select(`
            *,
            categories (
              id,
              name,
              slug
            )
          `)
          .single()

        if (error) throw error
        setMenuItems(menuItems.map((item) => (item.id === editingItem.id ? data : item)))
      } else {
        const { data, error } = await supabase
          .from("menu_items")
          .insert([{ ...itemData, is_available: true }])
          .select(`
            *,
            categories (
              id,
              name,
              slug
            )
          `)
          .single()

        if (error) throw error
        setMenuItems([data, ...menuItems])
      }
      resetForm()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", category_id: "", price: "", description: "", image_url: "" })
    setImageFile(null) // ← NUEVO
    setEditingItem(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category_id: item.category_id,
      price: item.price.toString(),
      description: item.description,
      image_url: item.image_url || "",
    })
    setImageFile(null) // ← NUEVO (por si el usuario no cambia la imagen)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id)
      if (error) throw error
      setMenuItems(menuItems.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const toggleStatus = async (id: string) => {
    try {
      const item = menuItems.find((item) => item.id === id)
      if (!item) return

      const { data, error } = await supabase
        .from("menu_items")
        .update({ is_available: !item.is_available })
        .eq("id", id)
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .single()

      if (error) throw error
      setMenuItems(menuItems.map((item) => (item.id === id ? data : item)))
    } catch (error) {
      console.error("Error toggling status:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/protected">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Link>
              </Button>
              <h1 className="text-xl font-semibold">Gestión de Menú</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Plato
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Editar Plato" : "Agregar Nuevo Plato"}</DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Modifica los datos del plato" : "Completa la información del nuevo plato"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre del Plato</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price">Precio ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  {/* CAMBIO: selector de archivo en lugar de URL */}
                  <div>
                    <Label htmlFor="image_file">Imagen (opcional)</Label>
                    <Input
                      id="image_file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {editingItem ? "Actualizar" : "Agregar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Platos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.categories?.name || categories.find((cat) => cat.id === item.category_id)?.name}
                        </Badge>
                      </TableCell>
                      <TableCell>${item.price}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.is_available ? "default" : "secondary"}
                          className={item.is_available ? "bg-green-500" : "bg-gray-500"}
                        >
                          {item.is_available ? "Disponible" : "No disponible"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleStatus(item.id)}>
                            {item.is_available ? "Desactivar" : "Activar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
