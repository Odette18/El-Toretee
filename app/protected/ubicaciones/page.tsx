"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type Location = {
  id: string
  name: string
  address: string
  phone?: string
  features?: string[]
  is_active: boolean
  image_url?: string
  hours_monday?: string
  hours_tuesday?: string
  hours_wednesday?: string
  hours_thursday?: string
  hours_friday?: string
  hours_saturday?: string
  hours_sunday?: string
}

export default function AdminUbicacionesPage() {
  const [ubicaciones, setUbicaciones] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Location | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    features: "",
    image_url: "",
    hours_monday: "",
    hours_tuesday: "",
    hours_wednesday: "",
    hours_thursday: "",
    hours_friday: "",
    hours_saturday: "",
    hours_sunday: "",
  })

  const supabase = createClient()

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      if (data) setUbicaciones(data)
    } catch (error) {
      console.error("Error fetching locations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const locationData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone || undefined,
        features: formData.features ? formData.features.split(",").map((f) => f.trim()) : [],
        image_url: formData.image_url || undefined,
        hours_monday: formData.hours_monday || undefined,
        hours_tuesday: formData.hours_tuesday || undefined,
        hours_wednesday: formData.hours_wednesday || undefined,
        hours_thursday: formData.hours_thursday || undefined,
        hours_friday: formData.hours_friday || undefined,
        hours_saturday: formData.hours_saturday || undefined,
        hours_sunday: formData.hours_sunday || undefined,
      }

      if (editingItem) {
        const { data, error } = await supabase
          .from("locations")
          .update(locationData)
          .eq("id", editingItem.id)
          .select()
          .single()

        if (error) throw error
        setUbicaciones(ubicaciones.map((item) => (item.id === editingItem.id ? data : item)))
      } else {
        const { data, error } = await supabase
          .from("locations")
          .insert([{ ...locationData, is_active: true }])
          .select()
          .single()

        if (error) throw error
        setUbicaciones([data, ...ubicaciones])
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
      name: "",
      address: "",
      phone: "",
      features: "",
      image_url: "",
      hours_monday: "",
      hours_tuesday: "",
      hours_wednesday: "",
      hours_thursday: "",
      hours_friday: "",
      hours_saturday: "",
      hours_sunday: "",
    })
    setEditingItem(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (item: Location) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      address: item.address,
      phone: item.phone || "",
      features: item.features?.join(", ") || "",
      image_url: item.image_url || "",
      hours_monday: item.hours_monday || "",
      hours_tuesday: item.hours_tuesday || "",
      hours_wednesday: item.hours_wednesday || "",
      hours_thursday: item.hours_thursday || "",
      hours_friday: item.hours_friday || "",
      hours_saturday: item.hours_saturday || "",
      hours_sunday: item.hours_sunday || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("locations").delete().eq("id", id)
      if (error) throw error
      setUbicaciones(ubicaciones.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting location:", error)
    }
  }

  const toggleStatus = async (id: string) => {
    try {
      const location = ubicaciones.find((l) => l.id === id)
      if (!location) return

      const { data, error } = await supabase
        .from("locations")
        .update({ is_active: !location.is_active })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      setUbicaciones(ubicaciones.map((item) => (item.id === id ? data : item)))
    } catch (error) {
      console.error("Error toggling status:", error)
    }
  }

  const getHoursDisplay = (location: Location) => {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

    const schedules = days.map((day, index) => {
      const hours = location[`hours_${day}` as keyof Location] as string
      return { day: dayNames[index], hours: hours || null }
    })

    const groupedSchedules: Array<{ days: string; hours: string }> = []
    let currentGroup: { days: string[]; hours: string | null } = { days: [], hours: null }

    schedules.forEach((schedule) => {
      if (schedule.hours && schedule.hours === currentGroup.hours) {
        currentGroup.days.push(schedule.day)
      } else if (schedule.hours) {
        if (currentGroup.days.length > 0 && currentGroup.hours) {
          const daysRange =
            currentGroup.days.length > 2 &&
            currentGroup.days[0] === "Lun" &&
            currentGroup.days[currentGroup.days.length - 1] === "Sáb"
              ? "Lun–Sáb"
              : currentGroup.days.length > 1
              ? `${currentGroup.days[0]}–${currentGroup.days[currentGroup.days.length - 1]}`
              : currentGroup.days.join(", ")

          groupedSchedules.push({
            days: daysRange,
            hours: currentGroup.hours,
          })
        }
        currentGroup = { days: [schedule.day], hours: schedule.hours }
      }
    })

    if (currentGroup.days.length > 0 && currentGroup.hours) {
      const daysRange =
        currentGroup.days.length > 2 &&
        currentGroup.days[0] === "Lun" &&
        currentGroup.days[currentGroup.days.length - 1] === "Sáb"
          ? "Lun–Sáb"
          : currentGroup.days.length > 1
          ? `${currentGroup.days[0]}–${currentGroup.days[currentGroup.days.length - 1]}`
          : currentGroup.days.join(", ")

      groupedSchedules.push({
        days: daysRange,
        hours: currentGroup.hours,
      })
    }

    if (groupedSchedules.length === 0) {
      return "Horarios no especificados"
    }

    return groupedSchedules.map((g) => `${g.days}: ${g.hours}`).join(" | ")
  }

  if (loading) {
    return (
      // responsive: centra el loader y usa altura mínima del viewport
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
          {/* responsive: toolbar que se adapta y hace wrap */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/protected">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Link>
              </Button>
              <h1 className="text-xl font-semibold">Gestión de Ubicaciones</h1>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Ubicación
                </Button>
              </DialogTrigger>
              {/* responsive: ancho máximo del diálogo en sm */}
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Editar Ubicación" : "Agregar Nueva Ubicación"}</DialogTitle>
                </DialogHeader>

                {/* responsive: grid 1 col en móvil, 2 cols en md para algunos grupos */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Sucursal</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
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
                  </div>

                  {/* Horarios: grid 2 cols en móvil, 3 en md, 4 en lg */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="hours_monday">Lunes</Label>
                      <Input
                        id="hours_monday"
                        value={formData.hours_monday}
                        onChange={(e) => setFormData({ ...formData, hours_monday: e.target.value })}
                        placeholder="09:00 - 21:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hours_tuesday">Martes</Label>
                      <Input
                        id="hours_tuesday"
                        value={formData.hours_tuesday}
                        onChange={(e) => setFormData({ ...formData, hours_tuesday: e.target.value })}
                        placeholder="09:00 - 21:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hours_wednesday">Miércoles</Label>
                      <Input
                        id="hours_wednesday"
                        value={formData.hours_wednesday}
                        onChange={(e) => setFormData({ ...formData, hours_wednesday: e.target.value })}
                        placeholder="09:00 - 21:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hours_thursday">Jueves</Label>
                      <Input
                        id="hours_thursday"
                        value={formData.hours_thursday}
                        onChange={(e) => setFormData({ ...formData, hours_thursday: e.target.value })}
                        placeholder="09:00 - 21:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hours_friday">Viernes</Label>
                      <Input
                        id="hours_friday"
                        value={formData.hours_friday}
                        onChange={(e) => setFormData({ ...formData, hours_friday: e.target.value })}
                        placeholder="09:00 - 21:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hours_saturday">Sábado</Label>
                      <Input
                        id="hours_saturday"
                        value={formData.hours_saturday}
                        onChange={(e) => setFormData({ ...formData, hours_saturday: e.target.value })}
                        placeholder="09:00 - 21:00"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2 lg:col-span-2">
                      <Label htmlFor="hours_sunday">Domingo</Label>
                      <Input
                        id="hours_sunday"
                        value={formData.hours_sunday}
                        onChange={(e) => setFormData({ ...formData, hours_sunday: e.target.value })}
                        placeholder="09:00 - 21:00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="features">Servicios (separados por coma)</Label>
                    <Textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      placeholder="Ej: Estacionamiento, WiFi Gratis, Delivery"
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
            <CardTitle>Lista de Ubicaciones</CardTitle>
          </CardHeader>
          <CardContent>
            {/* responsive: scroll horizontal en móvil */}
            <div className="w-full overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ubicaciones.map((ubicacion) => (
                    <TableRow key={ubicacion.id}>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium">{ubicacion.name}</div>
                            <div className="text-sm text-muted-foreground">{getHoursDisplay(ubicacion)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="text-sm">{ubicacion.address}</div>
                          {ubicacion.features?.length ? (
                            <div className="text-xs text-muted-foreground mt-1">
                              {ubicacion.features.join(", ")}
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{ubicacion.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant={ubicacion.is_active ? "default" : "secondary"}
                          className={ubicacion.is_active ? "bg-green-500" : "bg-gray-500"}
                        >
                          {ubicacion.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {/* responsive: acciones con wrap */}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(ubicacion)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleStatus(ubicacion.id)}>
                            {ubicacion.is_active ? "Desactivar" : "Activar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(ubicacion.id)}
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
