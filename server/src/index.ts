import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import jwt from 'jsonwebtoken'

const app = express()
const PORT = process.env.PORT || 4000
const ROOT_DIR = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT_DIR, 'data')
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads')
const CLIENT_DIST = path.join(ROOT_DIR, 'dist')

// Configuración de autenticación
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_2024'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'inmobiliaria2024'

// Ensure directories exist
fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(UPLOADS_DIR))

// Simple file persistence helpers
const dataFilePath = path.join(DATA_DIR, 'properties.json')

type Property = {
  id: string
  title: string
  description?: string
  priceUsd: number
  address?: string
  bedrooms?: number
  bathrooms?: number
  lat?: number
  lng?: number
  images: string[]
  featured?: boolean
  type?: string
  status?: string
}

function readProperties(): Property[] {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf-8')
    }
    const raw = fs.readFileSync(dataFilePath, 'utf-8')
    return JSON.parse(raw) as Property[]
  } catch {
    return []
  }
}

function writeProperties(list: Property[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(list, null, 2), 'utf-8')
}

// Initialize data file with a sample if empty
if (!fs.existsSync(dataFilePath)) {
  writeProperties([
    {
      id: '1',
      title: 'Departamento en Palermo',
      description: '2 ambientes luminosos cerca de parques y polo gastronómico.',
      priceUsd: 150000,
      address: 'Cerviño 4800, Palermo, CABA',
      bedrooms: 2,
      bathrooms: 1,
      lat: -34.573,
      lng: -58.419,
      images: [],
      featured: true,
      type: 'Departamento',
      status: 'En venta',
    },
  ])
}

// Middleware de autenticación
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

// Ruta de login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña requeridos' })
  }

  // Verificar credenciales
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const user = { username: ADMIN_USERNAME, role: 'admin' }
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' })
    
    res.json({ 
      success: true, 
      token, 
      user 
    })
  } else {
    res.status(401).json({ message: 'Usuario o contraseña incorrectos' })
  }
})

// Verificar estado de autenticación
app.get('/api/auth-check', authenticateToken, (req: any, res) => {
  res.json({ 
    success: true, 
    user: req.user 
  })
})

app.get('/api/properties', (_req, res) => {
  const list = readProperties()
  res.json(list)
})

app.get('/api/properties/:id', (req, res) => {
  const list = readProperties()
  const found = list.find((p) => p.id === req.params.id)
  if (!found) return res.status(404).json({ message: 'No encontrada' })
  res.json(found)
})

// Create property (protegida)
app.post('/api/properties', authenticateToken, (req, res) => {
  const body = req.body ?? {}
  if (!body.title || typeof body.priceUsd !== 'number') {
    return res.status(400).json({ message: 'Campos requeridos: title, priceUsd' })
  }
  const list = readProperties()
  const newItem: Property = {
    id: Date.now().toString(),
    title: String(body.title),
    description: body.description ? String(body.description) : undefined,
    priceUsd: Number(body.priceUsd),
    address: body.address ? String(body.address) : undefined,
    bedrooms: body.bedrooms != null ? Number(body.bedrooms) : undefined,
    bathrooms: body.bathrooms != null ? Number(body.bathrooms) : undefined,
    lat: body.lat != null ? Number(body.lat) : undefined,
    lng: body.lng != null ? Number(body.lng) : undefined,
    images: Array.isArray(body.images) ? body.images.map(String) : [],
    featured: Boolean(body.featured),
    type: body.type ? String(body.type) : undefined,
    status: body.status ? String(body.status) : undefined,
  }
  list.push(newItem)
  writeProperties(list)
  res.status(201).json(newItem)
})

// Update property (protegida)
app.put('/api/properties/:id', authenticateToken, (req, res) => {
  const id = req.params.id
  const list = readProperties()
  const idx = list.findIndex((p) => p.id === id)
  if (idx === -1) return res.status(404).json({ message: 'No encontrada' })
  const prev = list[idx]
  const body = req.body ?? {}
  const updated: Property = {
    ...prev,
    ...body,
    id: prev.id,
    priceUsd: body.priceUsd != null ? Number(body.priceUsd) : prev.priceUsd,
    bedrooms: body.bedrooms != null ? Number(body.bedrooms) : prev.bedrooms,
    bathrooms: body.bathrooms != null ? Number(body.bathrooms) : prev.bathrooms,
    lat: body.lat != null ? Number(body.lat) : prev.lat,
    lng: body.lng != null ? Number(body.lng) : prev.lng,
    featured: body.featured != null ? Boolean(body.featured) : prev.featured,
    images: Array.isArray(body.images) ? body.images.map(String) : prev.images,
  }
  list[idx] = updated
  writeProperties(list)
  res.json(updated)
})

// Delete property (protegida)
app.delete('/api/properties/:id', authenticateToken, (req, res) => {
  const id = req.params.id
  const list = readProperties()
  const exists = list.some((p) => p.id === id)
  if (!exists) return res.status(404).json({ message: 'No encontrada' })
  const next = list.filter((p) => p.id !== id)
  writeProperties(next)
  res.status(204).send()
})

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body ?? {}
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Datos incompletos' })
  }
  res.json({ ok: true })
})

// File uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext)
    const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, '_')
    cb(null, `${Date.now()}_${safeBase}${ext}`)
  },
})
const upload = multer({ storage })

app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Archivo requerido' })
  const publicUrl = `/uploads/${req.file.filename}`
  res.status(201).json({ url: publicUrl })
})

// 📌 Servir el frontend (dist) en producción
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`)
})

