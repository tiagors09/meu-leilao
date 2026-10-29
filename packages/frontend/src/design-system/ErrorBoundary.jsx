import { Component } from 'react'
import { Button } from './Button.jsx'
import { Card } from './Card.jsx'

export class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <main className="min-h-screen bg-[#f4f4f0] p-6 pt-20">
        <Card tone="pink" className="mx-auto max-w-xl text-center" role="alert">
          <h1 className="text-2xl font-black">O painel encontrou um erro</h1>
          <p className="mt-3 font-semibold">Atualize a pagina para tentar novamente.</p>
          <Button className="mt-5" onClick={() => window.location.reload()}>Atualizar pagina</Button>
        </Card>
      </main>
    }
    return this.props.children
  }
}
