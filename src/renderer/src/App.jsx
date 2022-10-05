import { Form, Versions } from './components'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container">
        <Form />
      </div>
      <Versions />
    </QueryClientProvider>
  )
}
