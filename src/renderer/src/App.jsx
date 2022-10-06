import Cookies from 'js-cookie'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Typography, Box } from '@mui/material'
import { fetchMatchIds } from './utils/fetchers'
import { Form, Data } from './routes'
import { Versions } from './components'

const db = (data) => {
  const puuid = Cookies.get('puuid')
  if (data) return localStorage.setItem(puuid, data)
  data = localStorage.getItem(puuid)
  return data ? JSON.parse(data) : null
}

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
    loader: () => {
      const userData = db() || {
        matches: [],
        latest: null
      }
      const [key, region] = [Cookies.get('key'), Cookies.get('region')]
      return fetchMatchIds({
        key,
        region,
        puuid: Cookies.get('puuid'),
        latest: userData.latest
      })
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
