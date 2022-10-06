import Cookies from 'js-cookie'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Typography, Box } from '@mui/material'
import { fetchMatchIds, fetchMatch } from './utils/fetchers'
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
    loader: async () => {
      const userData = db() || {
        matches: [],
        latest: null
      }
      const { matches, latest } = userData
      const creds = {
        key: Cookies.get('key'),
        region: Cookies.get('region')
      }
      const matchIds = await fetchMatchIds({
        ...creds,
        puuid: Cookies.get('puuid'),
        latest
      })
      userData.latest = Date.now()
      matchIds.reverse()
      for (let i = 0; i < matchIds.length; i += 20) {
        if (i % 100 === 0) await new Promise(r => setTimeout(r, 120000));
        const currMatches = matchIds
          .slice(i, i + 20)
          .map((matchId) => fetchMatch({ ...creds, matchId }))
        const resolved = await Promise.all(currMatches)
        resolved.forEach((m) => matches.push(m))
      }
      console.log(matches)
      return matches
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
