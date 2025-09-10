# Inmobiliaria Web (React + Vite + Bootstrap 5)

Aplicación web inmobiliaria responsiva, inspirada en Diego Nadal Inmobiliaria, con mejoras de diseño, usabilidad y rendimiento.

## Tecnologías
- React + Vite (TypeScript)
- Bootstrap 5, React-Bootstrap
- Wouter (ruteo)
- AOS (animaciones)
- Leaflet (mapa)

## Scripts
```bash
# Desarrollo (cliente + servidor)
npm run dev

# Build de cliente y servidor
npm run build

# Preview del cliente (estático)
npm run preview

# Solo backend (si fuera necesario)
npm run start:server
```

## Estructura
- client/: app React (Vite)
- server/: API Express básica (opcional si usás datos locales)
- client/src/components/: Navbar, Hero, Filters, PropertyCard, Services, About, Footer, WhatsAppButton
- client/src/pages/: Home, Properties, PropertyDetail, Services, About, Contact
- client/src/data/properties.json: datos locales

## Variables y estilos
- Paleta en client/src/theme.css
- Bootstrap importado en client/src/main.tsx

## Deploy
### Netlify
1. New site from Git, repo de este proyecto.
2. Build command: npm run build:client
3. Publish directory: client/dist

### Vercel
1. Importar proyecto.
2. Framework: Vite.
3. Build Command: npm run build:client
4. Output Directory: client/dist

### Render (frontend estático)
1. New Static Site.
2. Build Command: npm run build:client
3. Publish Directory: client/dist

### Render/Vercel (fullstack opcional)
- Deployear client como estático y server como servicio Node.
- Configurar variable PORT en server y la URL en el proxy si se expone.

## Notas
- Los datos locales se cargan desde properties.json. Podés cambiar imágenes, títulos y precios.
- WhatsApp flotante apunta a https://wa.me/5493435172107.
