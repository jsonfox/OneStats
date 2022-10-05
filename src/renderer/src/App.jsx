import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Typography, Box } from '@mui/material'
import { Form, Data, Versions } from './components'

const queryClient = new QueryClient()

export default function App() {
  const [formSubmitted, setFormSubmitted] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <Typography variant="h4" textAlign="center">
        Seasonal Stats
      </Typography>
      <Box component="main" className="container" paddingY={5}>
        {!formSubmitted ? (
          <Form onSubmit={() => setFormSubmitted(true)} />
        ) : (
          <Data onReset={() => setFormSubmitted(false)} />
        )}
      </Box>
      <Versions />
    </QueryClientProvider>
  )
}
