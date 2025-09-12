import { Container, Row, Col } from 'react-bootstrap'
import { useQuery } from '@tanstack/react-query'
import Hero from '../components/Hero'
import Services from '../components/Services'
import About from '../components/About'
import PropertyCard from '../components/PropertyCard'
import type { PropertyItem } from '../components/PropertyCard'
import { apiRequest } from '../lib/api'

export default function Home() {
  // Usar API en lugar de archivo estático para mostrar propiedades actualizadas
  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const res = await apiRequest('/api/properties')
      return await res.json() as PropertyItem[]
    }
  })

  // Mostrar propiedades destacadas o las primeras 3 si no hay destacadas
  const featuredList = properties.filter(p => p.featured)
  const featured = featuredList.length > 0 ? featuredList.slice(0, 3) : properties.slice(0, 3)
  
  return (
    <>
      <Hero />
      <Container className="py-4 py-md-5">
        <h2 className="mb-3 mb-md-4 text-center text-md-start">Propiedades destacadas</h2>
        <Row className="g-3 g-md-4">
          {featured.map((p) => (
            <Col key={p.id} xs={12} sm={6} lg={4}>
              <PropertyCard item={p} />
            </Col>
          ))}
        </Row>
      </Container>
      <Services />
      <About />
    </>
  )
}


