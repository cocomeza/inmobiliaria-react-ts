import { useEffect, useState } from 'react'
import { useRoute } from 'wouter'
import { Container, Row, Col, Carousel } from 'react-bootstrap'
import { useQuery } from '@tanstack/react-query'
import { apiRequest, getImageUrl } from '../lib/api'
import type { PropertyItem } from '../components/PropertyCard'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Icono personalizado para el marcador
const defaultIcon = icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconAnchor: [12, 41],
  popupAnchor: [0, -28],
})

export default function PropertyDetail() {
  const [, params] = useRoute('/propiedad/:id')
  
  // Usar API para obtener propiedades actualizadas
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const res = await apiRequest('/api/properties')
      return await res.json() as PropertyItem[]
    }
  })
  
  const item = properties.find((p) => p.id === params?.id)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando propiedad...</p>
        </div>
      </Container>
    )
  }

  if (!item) {
    return (
      <Container className="py-5">
        <h1>Propiedad no encontrada</h1>
      </Container>
    )
  }

  const [active, setActive] = useState(0)

  return (
    <Container className="py-5">
      <Row className="g-4">
        <Col md={7}>
          {item.images?.length ? (
            <>
              <Carousel
                className="rounded overflow-hidden shadow-sm"
                activeIndex={active}
                onSelect={(idx) => setActive(idx)}
                controls
                indicators
                interval={4000}
                pause="hover"
                fade={false}
              >
                {item.images.map((src, idx) => (
                  <Carousel.Item key={idx}>
                    <img src={getImageUrl(src)} alt={`${item.title} ${idx + 1}`} className="d-block w-100" />
                  </Carousel.Item>
                ))}
              </Carousel>

              <div className="mt-3 d-flex gap-2 flex-wrap">
                {item.images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActive(idx)}
                    className={`p-0 border-0 bg-transparent ${active === idx ? 'opacity-100' : 'opacity-75'}`}
                    aria-label={`Ver imagen ${idx + 1}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={getImageUrl(src)}
                      alt={`thumb ${idx + 1}`}
                      style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 6, border: active === idx ? '2px solid var(--color-glacier)' : '2px solid transparent' }}
                    />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <img src={"https://placehold.co/1200x800/png"} alt={item.title} className="img-fluid rounded shadow-sm" />
          )}
          <div className="mt-3 text-secondary">{item.description}</div>
        </Col>
        <Col md={5}>
          <h1 className="h3">{item.title}</h1>
          <div className="mb-3">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(item.priceUsd)}</div>
          {/* Mapa interactivo con Leaflet */}
          <div className="ratio ratio-4x3 rounded overflow-hidden">
            {item.lat && item.lng ? (
              <MapContainer
                center={[item.lat!, item.lng!]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', borderRadius: '0.375rem' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[item.lat!, item.lng!]} icon={defaultIcon}>
                  <Popup>
                    <div>
                      <strong>{item.title}</strong><br />
                      {item.address && <>{item.address}<br /></>}
                      <span className="text-success fw-bold">
                        {new Intl.NumberFormat('es-AR', { 
                          style: 'currency', 
                          currency: 'USD', 
                          maximumFractionDigits: 0 
                        }).format(item.priceUsd)}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="d-flex align-items-center justify-content-center bg-light h-100">
                <div className="text-center text-muted">
                  <i className="fas fa-map-marker-alt fa-2x mb-2"></i>
                  <p className="mb-0">Ubicación no disponible</p>
                  <small>Coordenadas no configuradas</small>
                </div>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  )
}


