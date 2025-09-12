import { Card, Badge } from 'react-bootstrap'
import { Link } from 'wouter'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getImageUrl } from '../lib/api'

// Configurar icono por defecto de Leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export interface PropertyItem {
  id: string
  title: string
  description?: string
  priceUsd: number
  images: string[]
  type?: string
  status?: 'En venta' | 'En alquiler'
  address?: string
  bedrooms?: number
  bathrooms?: number
  lat?: number
  lng?: number
  featured?: boolean
}

export default function PropertyCard({ item }: { item: PropertyItem }) {
  const price = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(item.priceUsd)
  const cover = getImageUrl(item.images?.[0] || '/placeholder.jpg')
  return (
    <Link href={`/propiedad/${item.id}`}>
      <Card className="h-100 shadow-sm card-hover" data-aos="fade-up" as="div" role="button">
        <div style={{ position: 'relative' }}>
          <Card.Img 
            variant="top" 
            src={cover} 
            alt={item.title} 
            className="card-img-responsive"
            style={{ 
              objectFit: 'cover', 
              height: '200px',
              width: '100%'
            }} 
          />
          <Badge bg="light" text="dark" className="position-absolute m-2 badge-status" style={{ top: 0, right: 0 }}>
            {item.status}
          </Badge>
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title className="mb-2 fs-5 fs-sm-4">{item.title}</Card.Title>
          <div className="text-muted small mb-2">{item.type}</div>
          <div className="fw-semibold text-armadillo mb-2 fs-6">{price}</div>
          
          {/* Mapa pequeño si hay coordenadas */}
          {item.lat != null && item.lng != null && (
            <div className="mb-2" style={{ height: '120px', borderRadius: '6px', overflow: 'hidden' }}>
              <MapContainer
                center={[item.lat, item.lng] as any}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                doubleClickZoom={false}
                touchZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[item.lat, item.lng] as any} icon={defaultIcon as any} />
              </MapContainer>
            </div>
          )}
          
          <Card.Text className="mt-auto text-secondary small lh-sm" style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '3.6em'
          }}>
            {item.description}
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  )
}


