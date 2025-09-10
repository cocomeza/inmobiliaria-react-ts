import { useEffect, useMemo, useState } from 'react'
import { useRoute } from 'wouter'
import { Container, Row, Col, Carousel } from 'react-bootstrap'
import data from '../data/properties.json'
import type { PropertyItem } from '../components/PropertyCard'
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// import { icon } from 'leaflet'

// Temporalmente deshabilitado el mapa para resolver errores de build
// const defaultIcon = icon({
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//   iconAnchor: [12, 41],
//   popupAnchor: [0, -28],
// })

export default function PropertyDetail() {
  const [, params] = useRoute('/propiedad/:id')
  const item = useMemo(() => (data as PropertyItem[]).find((p) => p.id === params?.id), [params])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

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
                    <img src={src} alt={`${item.title} ${idx + 1}`} className="d-block w-100" />
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
                      src={src}
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
          <div className="ratio ratio-4x3 rounded overflow-hidden bg-light d-flex align-items-center justify-content-center">
            <div className="text-center text-muted">
              <div className="mb-2">
                <i className="fas fa-map-marker-alt fa-3x"></i>
              </div>
              <h6>Ubicación</h6>
              <p className="small mb-0">Esperanza, Santa Fe, Argentina</p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  )
}


