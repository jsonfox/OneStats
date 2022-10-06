import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Typography, Box } from '@mui/material'
import { Form, Data } from './routes'
import { Versions } from './components'

const router = createBrowserRouter([
  {
    element: <Form />,
    path: '/',
    loader: async () => {
      return fetch(
        'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json'
      ).then((res) =>
        res.json().then((data) => data.slice(1).map(({ id, name }) => ({ label: name, id })))
      )
    }
  },
  {
    element: <Data />,
    path: 'data',
    loader: async () => {
      return new Promise((resolve) => setTimeout(() => resolve(5), 5000))
    }
  }
])

export default function App() {
  return (
    <>
      <Typography variant="h4" textAlign="center">
        Seasonal Stats
      </Typography>
      <Box component="main" className="container" paddingY={5}>
        <RouterProvider router={router} />
      </Box>
      <a href="/">Home</a>
      <Versions />
    </>
  )
}
