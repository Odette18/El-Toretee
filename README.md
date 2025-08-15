<<<<<<< HEAD
# El-Toretee
Repositorio para estancias  Oficial
=======
# El Torete Burger - Panel de Administración y Sitio Web

Bienvenido al repositorio de **El Torete Burger**, un sistema completo para la gestión de menús, promociones, ubicaciones y usuarios de un restaurante, con panel de administración y sitio web público.

## Tecnologías principales

- **Next.js** (App Router)
- **React**
- **Supabase** (Base de datos y autenticación)
- **TailwindCSS** (Estilos)
- **Lucide Icons** (Iconografía)
- **TypeScript**

## Estructura del proyecto

```
el-torete/
  ├── app/                # Páginas y rutas (Next.js)
  │   ├── (auth)/         # Rutas de autenticación (login, recuperar contraseña, etc.)
  │   ├── (landing)/      # Sitio público (menú, promociones, ubicaciones)
  │   ├── protected/      # Panel de administración (requiere login)
  │   └── ...             # Otros archivos de configuración y layout
  ├── components/         # Componentes reutilizables de UI y formularios
  ├── lib/                # Lógica de conexión a Supabase y utilidades
  ├── public/             # Imágenes y recursos estáticos
  └── ...
```

## Instalación y configuración

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/Odette18/El-Torete.git
   cd el-torete-burger/el-torete
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**

   Crea un archivo `.env.local` en la raíz de `el-torete/` con las siguientes variables (puedes obtenerlas desde tu proyecto de Supabase):

   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```

4. **Ejecuta el proyecto en desarrollo:**
   ```bash
   npm run dev
   ```

5. **Abre en tu navegador:**  
   [http://localhost:3000](http://localhost:3000)

## Funcionalidades principales

- **Sitio público:**  
  Consulta el menú, promociones y ubicaciones sin necesidad de iniciar sesión.

- **Panel de administración:**  
  Acceso protegido para gestionar:
  - Menú (agregar, editar, eliminar platos)
  - Promociones
  - Ubicaciones
  - Usuarios/Administradores

- **Autenticación:**  
  Solo los usuarios registrados pueden acceder al panel de administración.

## Scripts útiles

- `npm run dev` — Inicia el servidor de desarrollo
- `npm run build` — Compila la aplicación para producción
- `npm run start` — Inicia la aplicación en modo producción

## Personalización

- **Estilos:**  
  Modifica `globals.css` y `tailwind.config.ts` para personalizar la apariencia.
- **Componentes:**  
  Los componentes reutilizables están en `components/`.

---

>>>>>>> cc2d33b (Deploy El Torete)
