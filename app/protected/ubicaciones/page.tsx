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
  phone: string | null
  features: string[] | null
  is_active: boolean
  image_url: string | null
  hours_monday: string | null
  hours_tuesday: string | null
  hours_wednesday: string | null
  hours_thursday: string | null
  hours_friday: string | null
  hours_saturday: string | null
  hours_sunday: string | null
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUbicaciones((data ?? []) as Location[])
    } catch (error) {
      console.error("Error fetching locations:", error)
      alert("No se pudieron cargar las ubicaciones.")
    } finally {
      setLoading(false)
    }
  }

  const parseFeatures = (raw: string): string[] | null => {
    const arr = raw
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
    return arr.length ? arr : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validación mínima
      if (!formData.name.trim()) throw new Error("El nombre de la sucursal es obligatorio.")
      if (!formData.address.trim()) throw new Error("La dirección es obligatoria.")
      if (!formData.phone.trim()) throw new Error("El teléfono es obligatorio.")

      // Normalización: "" -> null
      const locationData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim() || null,
        features: parseFeatures(formData.features),        // array o null
        image_url: formData.image_url.trim() || null,
        hours_monday: formData.hours_monday.trim() || null,
        hours_tuesday: formData.hours_tuesday.trim() || null,
        hours_wednesday: formData.hours_wednesday.trim() || null,
        hours_thursday: formData.hours_thursday.trim() || null,
        hours_friday: formData.hours_friday.trim() || null,
        hours_saturday: formData.hours_saturday.trim() || null,
        hours_sunday: formData.hours_sunday.trim() || null,
      }

      let resp
      if (editingItem) {
        resp = await supabase
          .from("locations")
          .update(locationData)
          .eq("id", editingItem.id)
          .select()
          .single()
      } else {
        resp = await supabase
          .from("locations")
          .insert([{ ...locationData, is_active: true }])
          .select()
          .single()
      }

      const { data, error } = resp as { data: Location | null; error: any }
      if (error) {
        console.error("Supabase error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        throw new Error(error.message || "No se pudo guardar la ubicación.")
      }
      if (!data) throw new Error("La base de datos no devolvió la ubicación guardada.")

      if (editingItem) {
        setUbicaciones(prev => prev.map(item => (item.id === editingItem.id ? data : item)))
      } else {
        setUbicaciones(prev => [data, ...prev])
      }

      resetForm()
    } catch (err: any) {
      alert(err?.message || "Ocurrió un error guardando la ubicación.")
      console.error(err)
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
      name: item.name ?? "",
      address: item.address ?? "",
      phone: item.phone ?? "",
      features: item.features?.join(", ") ?? "",
      image_url: item.image_url ?? "",
      hours_monday: item.hours_monday ?? "",
      hours_tuesday: item.hours_tuesday ?? "",
      hours_wednesday: item.hours_wednesday ?? "",
      hours_thursday: item.hours_thursday ?? "",
      hours_friday: item.hours_friday ?? "",
      hours_saturday: item.hours_saturday ?? "",
      hours_sunday: item.hours_sunday ?? "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("locations").delete().eq("id", id)
      if (error) throw error
      setUbicaciones(prev => prev.filter(item => item.id !== id))
    } catch (error: any) {
      console.error("Error deleting location:", error)
      alert(error?.message || "No se pudo eliminar la ubicación.")
    }
  }

  const toggleStatus = async (id: string) => {
    try {
      const found = ubicaciones.find(l => l.id === id)
      if (!found) return

      const { data, error } = await supabase
        .from("locations")
        .update({ is_active: !found.is_active })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      setUbicaciones(prev => prev.map(item => (item.id === id ? (data as Location) : item)))
    } catch (error: any) {
      console.error("Error toggling status:", error)
      alert(error?.message || "No se pudo cambiar el estado.")
    }
  }

  const getHoursDisplay = (location: Location) => {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

    const schedules = days.map((day, index) => {
      const key = `hours_${day}` as keyof Location
      const hours = location[key] as string | null
      return { day: dayNames[index], hours: hours || null }
    })

    const grouped: Array<{ days: string; hours: string }> = []
    let current: { days: string[]; hours: string | null } = { days: [], hours: null }

    schedules.forEach(schedule => {
      if (schedule.hours && schedule.hours === current.hours) {
        current.days.push(schedule.day)
      } else if (schedule.hours) {
        if (current.days.length > 0 && current.hours) {
          const range =
            current.days.length > 2 &&
            current.days[0] === "Lun" &&
            current.days[current.days.length - 1] === "Sáb"
              ? "Lun–Sáb"
              : current.days.length > 1
              ? `${current.days[0]}–${current.days[current.days.length - 1]}`
              : current.days.join(", ")
          grouped.push({ days: range, hours: current.hours })
        }
        current = { days: [schedule.day], hours: schedule.hours }
      }
    })

    if (current.days.length > 0 && current.hours) {
      const range =
        current.days.length > 2 &&
        current.days[0] === "Lun" &&
        current.days[current.days.length - 1] === "Sáb"
          ? "Lun–Sáb"
          : current.days.length > 1
          ? `${current.days[0]}–${current.days[current.days.length - 1]}`
          : current.days.join(", ")
      grouped.push({ days: range, hours: current.hours })
    }

    if (grouped.length === 0) return "Horarios no especificados"
    return grouped.map(g => `${g.days}: ${g.hours}`).join(" | ")
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
                  Agregar Ubicación
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Editar Ubicación" : "Agregar Nueva Ubicación"}</DialogTitle>
                </DialogHeader>

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

                  {/* Horarios */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {[
                      ["hours_monday", "Lunes"],
                      ["hours_tuesday", "Martes"],
                      ["hours_wednesday", "Miércoles"],
                      ["hours_thursday", "Jueves"],
                      ["hours_friday", "Viernes"],
                      ["hours_saturday", "Sábado"],
                      ["hours_sunday", "Domingo"],
                    ].map(([key, label]) => (
                      <div className="space-y-2" key={key}>
                        <Label htmlFor={key}>{label}</Label>
                        <Input
                          id={key}
                          value={(formData as any)[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          placeholder="09:00 - 21:00"
                        />
                      </div>
                    ))}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Ubicaciones</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {ubicaciones.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                        No hay ubicaciones registradas todavía.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
