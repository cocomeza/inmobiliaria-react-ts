import { Container, Row, Col } from 'react-bootstrap'
import Hero from '../components/Hero'
import Services from '../components/Services'
import About from '../components/About'
import PropertyCard from '../components/PropertyCard'
import type { PropertyItem } from '../components/PropertyCard'
import data from '../data/properties.json'

export default function Home() {
  const featured = (data as PropertyItem[]).slice(0, 3)
  return (
    <>
      <Hero />
      <Container className="py-5">
        <h2 className="mb-4">Propiedades destacadas</h2>
        <Row className="g-4">
          {featured.map((p) => (
            <Col key={p.id} md={6} lg={4}>
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


