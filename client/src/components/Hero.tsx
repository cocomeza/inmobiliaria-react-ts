import { Container } from 'react-bootstrap'

export default function Hero() {
  const bg = 'url(/fotoHero.jpeg)'
  return (
    <div className="hero" style={{ backgroundImage: bg }}>
      <div className="w-100 hero-overlay py-5">
        <Container className="py-5 text-white">
          <h1 className="display-5 fw-semibold">Inmobiliaria cercana y profesional</h1>
          <p className="lead mb-4" style={{ maxWidth: 680 }}>
            Conocé nuestras propiedades y recibí asesoramiento personalizado para comprar, vender o alquilar en Entre Ríos.
          </p>
        </Container>
      </div>
    </div>
  )
}


