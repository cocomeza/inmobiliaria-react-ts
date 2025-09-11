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
          <div className="ratio ratio-4x3 rounded overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3327.087951976268!2d-60.06567572545429!3d-33.499088773370275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b9e370700a471f%3A0x40c71e9083743252!2sBelgrano%20938%2C%20B2914%20Villa%20Ramallo%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1757591393054!5m2!1ses-419!2sar" 
              width="100%" 
              height="100%" 
              style={{border: 0}} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de la propiedad"
            />
          </div>
        </Col>
      </Row>
    </Container>
  )
}


