"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft, User, Shield, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type UserProfile = {
  id: string
  full_name: string
  role: "admin" | "manager" | "staff"
  is_active: boolean
  created_at: string
  email?: string
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "" as "admin" | "manager" | "staff" | "",
    password: "",
  })

  const roles = [
    { value: "admin", label: "Administrador" },
    { value: "manager", label: "Manager" },
    { value: "staff", label: "Staff" },
  ]

  const supabase = createClient()

  // Cargar usuarios (mock inicial)
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const mockUsers: UserProfile[] = [
        {
          id: "1",
          full_name: "Administrador Principal",
          role: "admin",
          is_active: true,
          created_at: new Date().toISOString(),
          email: "admin@eltorete.com",
        },
      ]
      setUsuarios(mockUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingItem) {
        const { data, error } = await supabase
          .from("profiles")
          .update({
            full_name: formData.full_name,
            role: formData.role,
          })
          .eq("id", editingItem.id)
          .select()
          .single()

        if (error) throw error
        setUsuarios(usuarios.map((u) => (u.id === editingItem.id ? (data as UserProfile) : u)))
      } else {
        // Crear usuario: requiere flujo server-side (auth.admin.invite, edge function, etc.)
        alert("La creación de usuarios requiere configuración adicional del servidor")
      }
      resetForm()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({ full_name: "", email: "", role: "", password: "" })
    setEditingItem(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (item: UserProfile) => {
    setEditingItem(item)
    setFormData({
      full_name: item.full_name,
      email: item.email || "",
      role: item.role,
      password: "",
    })
    setIsDialogOpen(true)
  }

  const toggleStatus = async (id: string) => {
    try {
      const user = usuarios.find((u) => u.id === id)
      if (!user) return

      const { data, error } = await supabase
        .from("profiles")
        .update({ is_active: !user.is_active })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      setUsuarios(usuarios.map((u) => (u.id === id ? (data as UserProfile) : u)))
    } catch (error) {
      console.error("Error toggling status:", error)
    }
  }

  const getRoleIcon = (role: string) => {
    return role === "admin" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500"
      case "manager":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      // responsive: centra el loader en pantalla completa
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
              <h1 className="text-xl font-semibold">Gestión de Usuarios</h1>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Usuario
                </Button>
              </DialogTrigger>

              {/* responsive: ancho máximo del diálogo en sm */}
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Editar Usuario" : "Agregar Nuevo Usuario"}</DialogTitle>
                </DialogHeader>

                {/* responsive: grid 1 col en móvil, 2 col en md para inputs emparejados */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nombre Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required={!editingItem}
                        disabled={editingItem !== null}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Rol</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(v) =>
                          setFormData({ ...formData, role: v as "admin" | "manager" | "staff" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {!editingItem && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  )}

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
            <CardTitle>Lista de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            {/* responsive: scroll horizontal en móvil */}
            <div className="w-full overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{usuario.full_name}</div>
                            <div className="text-sm text-muted-foreground">{usuario.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(usuario.role)} text-white flex items-center`}>
                          {getRoleIcon(usuario.role)}
                          <span className="ml-1">
                            {roles.find((r) => r.value === usuario.role)?.label}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(usuario.created_at).toLocaleDateString("es-ES")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={usuario.is_active ? "default" : "secondary"}
                          className={usuario.is_active ? "bg-green-500" : "bg-gray-500"}
                        >
                          {usuario.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {/* responsive: acciones con wrap */}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(usuario)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleStatus(usuario.id)}>
                            {usuario.is_active ? "Desactivar" : "Activar"}
                          </Button>
                          {/* Si vas a borrar perfiles: */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => console.log("delete", usuario.id)}
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
