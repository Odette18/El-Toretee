"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft, Percent, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type Promotion = {
  id: string
  title: string
  description: string
  discount_percentage: number
  promo_category: string
  start_date?: string
  end_date?: string
  is_active: boolean
  terms_conditions?: string
  image_url?: string
}

export default function AdminPromocionesPage() {
  const [promociones, setPromociones] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    discount_percentage: "",
    promo_category: "",
    description: "",
    start_date: "",
    end_date: "",
    terms_conditions: "",
    image_url: "",
  })

  const promoTypes = [
    { value: "weekly", label: "Semanal" },
    { value: "combo", label: "Combo" },
    { value: "happy-hour", label: "Happy Hour" },
    { value: "daily", label: "Diario" },
  ]

  const supabase = createClient()

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      if (data) setPromociones(data)
    } catch (error) {
      console.error("Error fetching promotions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const promotionData = {
        title: formData.title,
        description: formData.description,
        discount_percentage: Number.parseFloat(formData.discount_percentage),
        promo_category: formData.promo_category,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        terms_conditions: formData.terms_conditions || undefined,
        image_url: formData.image_url || undefined,
      }

      if (editingItem) {
        const { data, error } = await supabase
          .from("promotions")
          .update(promotionData)
          .eq("id", editingItem.id)
          .select()
          .single()

        if (error) throw error
        setPromociones(promociones.map((item) => (item.id === editingItem.id ? data : item)))
      } else {
        const { data, error } = await supabase
          .from("promotions")
          .insert([{ ...promotionData, is_active: true }])
          .select()
          .single()

        if (error) throw error
        setPromociones([data, ...promociones])
      }
      resetForm()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      discount_percentage: "",
      promo_category: "",
      description: "",
      start_date: "",
      end_date: "",
      terms_conditions: "",
      image_url: "",
    })
    setEditingItem(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (item: Promotion) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      discount_percentage: item.discount_percentage.toString(),
      promo_category: item.promo_category,
      description: item.description,
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      terms_conditions: item.terms_conditions || "",
      image_url: item.image_url || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("promotions").delete().eq("id", id)
      if (error) throw error
      setPromociones(promociones.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting promotion:", error)
    }
  }

  const toggleStatus = async (id: string) => {
    try {
      const promotion = promociones.find((p) => p.id === id)
      if (!promotion) return

      const { data, error } = await supabase
        .from("promotions")
        .update({ is_active: !promotion.is_active })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      setPromociones(promociones.map((item) => (item.id === id ? data : item)))
    } catch (error) {
      console.error("Error toggling status:", error)
    }
  }

  if (loading) {
    return (
      // responsive: centra el loader y usa una altura mínima en viewport
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        {/* responsive: contenedor central con paddings por breakpoint */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* responsive: toolbar que se rompe en varias líneas si es necesario */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/protected">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Link>
              </Button>
              <h1 className="text-xl font-semibold">Gestión de Promociones</h1>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Promoción
                </Button>
              </DialogTrigger>
              {/* responsive: ancho máximo del dialog en sm */}
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Editar Promoción" : "Agregar Nueva Promoción"}
                  </DialogTitle>
                </DialogHeader>

                {/* responsive: grid 1 col en móvil, 2 cols en md */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="discount_percentage">Descuento (%)</Label>
                      <Input
                        id="discount_percentage"
                        type="number"
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promo_category">Tipo</Label>
                      <Select
                        value={formData.promo_category}
                        onValueChange={(value) => setFormData({ ...formData, promo_category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {promoTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Fecha de inicio</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">Fecha de fin</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terms_conditions">Términos y condiciones</Label>
                    <Textarea
                      id="terms_conditions"
                      value={formData.terms_conditions}
                      onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                      placeholder="Términos y condiciones opcionales"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url">URL de la Imagen (opcional)</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
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
      {/* responsive: contenedor central con paddings por breakpoint */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Promociones</CardTitle>
          </CardHeader>
          <CardContent>
            {/* responsive: tabla con scroll horizontal en móvil */}
            <div className="w-full overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Válido hasta</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promociones.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{promo.title}</div>
                          <div className="text-sm text-muted-foreground">{promo.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-secondary text-white">
                          <Percent className="h-3 w-3 mr-1" />
                          {promo.discount_percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {promoTypes.find((type) => type.value === promo.promo_category)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{promo.end_date || "Sin fecha límite"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={promo.is_active ? "default" : "secondary"}
                          className={promo.is_active ? "bg-green-500" : "bg-gray-500"}
                        >
                          {promo.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {/* responsive: acciones con wrap si no caben */}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(promo)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleStatus(promo.id)}>
                            {promo.is_active ? "Desactivar" : "Activar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(promo.id)}
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
