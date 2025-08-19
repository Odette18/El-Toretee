"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ArrowLeft, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Location = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  features: string[] | null;
  is_active: boolean;
  image_url: string | null;
  hours_monday: string | null;
  hours_tuesday: string | null;
  hours_wednesday: string | null;
  hours_thursday: string | null;
  hours_friday: string | null;
  hours_saturday: string | null;
  hours_sunday: string | null;
};

export default function AdminUbicacionesPage() {
  const [ubicaciones, setUbicaciones] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Location | null>(null);

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
  });

  const supabase = createClient();

  // 👉 Traer ubicaciones
  const fetchLocations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<Location[]>();

      if (error) throw error;
      setUbicaciones(data ?? []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void fetchLocations();
  }, [fetchLocations]);

  // 👉 Form helpers
  const parseFeatures = (raw: string): string[] | null => {
    const arr = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return arr.length ? arr : null;
  };

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
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const locationData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim() || null,
        features: parseFeatures(formData.features),
        image_url: formData.image_url.trim() || null,
        hours_monday: formData.hours_monday.trim() || null,
        hours_tuesday: formData.hours_tuesday.trim() || null,
        hours_wednesday: formData.hours_wednesday.trim() || null,
        hours_thursday: formData.hours_thursday.trim() || null,
        hours_friday: formData.hours_friday.trim() || null,
        hours_saturday: formData.hours_saturday.trim() || null,
        hours_sunday: formData.hours_sunday.trim() || null,
      };

      if (editingItem) {
        const { data, error } = await supabase
          .from("locations")
          .update(locationData)
          .eq("id", editingItem.id)
          .select()
          .single();

        if (error) throw error;
        setUbicaciones((prev) => prev.map((loc) => (loc.id === editingItem.id ? (data as Location) : loc)));
      } else {
        const { data, error } = await supabase
          .from("locations")
          .insert([{ ...locationData, is_active: true }])
          .select()
          .single();

        if (error) throw error;
        setUbicaciones((prev) => [data as Location, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error("Error guardando ubicación:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (loc: Location) => {
    setEditingItem(loc);
    setFormData({
      name: loc.name ?? "",
      address: loc.address ?? "",
      phone: loc.phone ?? "",
      features: loc.features?.join(", ") ?? "",
      image_url: loc.image_url ?? "",
      hours_monday: loc.hours_monday ?? "",
      hours_tuesday: loc.hours_tuesday ?? "",
      hours_wednesday: loc.hours_wednesday ?? "",
      hours_thursday: loc.hours_thursday ?? "",
      hours_friday: loc.hours_friday ?? "",
      hours_saturday: loc.hours_saturday ?? "",
      hours_sunday: loc.hours_sunday ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("locations").delete().eq("id", id);
      if (error) throw error;
      setUbicaciones((prev) => prev.filter((loc) => loc.id !== id));
    } catch (err) {
      console.error("Error deleting location:", err);
    }
  };

  const toggleStatus = async (id: string) => {
    const found = ubicaciones.find((l) => l.id === id);
    if (!found) return;

    const { data, error } = await supabase
      .from("locations")
      .update({ is_active: !found.is_active })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling status:", error);
      return;
    }

    setUbicaciones((prev) => prev.map((loc) => (loc.id === id ? (data as Location) : loc)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <Button variant="outline" asChild>
            <Link href="/protected">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Agregar Ubicación</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? "Editar Ubicación" : "Nueva Ubicación"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <Label>Nombre</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Label>Dirección</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
                <Label>Teléfono</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <Label>Servicios (coma)</Label>
                <Textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                />
                <Label>Imagen</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : editingItem ? "Actualizar" : "Agregar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Ubicaciones</CardTitle>
          </CardHeader>
          <CardContent>
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
                {ubicaciones.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {loc.name}
                      </div>
                    </TableCell>
                    <TableCell>{loc.address}</TableCell>
                    <TableCell>{loc.phone}</TableCell>
                    <TableCell>
                      <Badge className={loc.is_active ? "bg-green-500" : "bg-gray-500"}>
                        {loc.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(loc)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(loc.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(loc.id)}>
                        {loc.is_active ? "Desactivar" : "Activar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
