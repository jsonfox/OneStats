import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Typography, Box } from '@mui/material'
import { Form, Data } from './routes'
import { Versions } from './components'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Typography variant="h4" textAlign="center">
        Seasonal Stats
      </Typography>
      <Box component="main" className="container" paddingY={5}>
        <BrowserRouter>
          <Routes>
            <Route path="/" index element={<Form />} />
            <Route path="data" index element={<Data />} />
          </Routes>
        </BrowserRouter>
      </Box>
      <Versions />
    </QueryClientProvider>
  )
}
