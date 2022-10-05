import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Form, Data, Versions } from './components'

const queryClient = new QueryClient()

export default function App() {
  const [formSubmitted, setFormSubmitted] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container">
        {!formSubmitted ? (
          <Form onSubmit={() => setFormSubmitted(true)} />
        ) : (
          <Data onReset={() => setFormSubmitted(false)} />
        )}
      </div>
      <Versions />
    </QueryClientProvider>
  )
}
