import { Container } from 'react-bootstrap'

export default function Contact() {
  return (
    <Container className="py-5">
      <h1>Contacto</h1>
      <p className="text-secondary">Escribinos por WhatsApp para una respuesta rápida.</p>
      <div className="ratio ratio-16x9 mt-3">
        <iframe
          src="https://www.google.com/maps?q=Paran%C3%A1,+Entre+R%C3%ADos&output=embed"
          title="Mapa"
          loading="lazy"
        />
      </div>
    </Container>
  )
}


