import Cookies from 'js-cookie'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Typography, Box } from '@mui/material'
import { getMatchIds, getMatch } from './utils/fetchers'
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
      const [key, region] = [Cookies.get('key'), Cookies.get('region')]
      const matchIds = await getMatchIds({
        key,
        region,
        puuid: Cookies.get('puuid'),
        latest: userData.latest
      })

      return async function fetchAllMatches() {
        const matches = []
        for (const [i, id] of matchIds.entries()) {
          console.log(`Fetching match ${i} of ${matchIds.length}`)
          let retry = true
          let retryCount = 0
          while (retry && retryCount < 5) {
            try {
              if (retryCount > 0) console.log('Retrying match', i)
              const res = await getMatch({ key, region, id })
              console.log(res.status)
              if (res.status !== 200) throw new Error()
              matches.push(res.data.info)
              retry = false
            } catch (err) {
              console.error(err)
              console.log('Retrying in 30 seconds')
              await new Promise((res) =>
                setTimeout(() => {
                  retryCount++
                  res()
                }, 30000)
              )
            }
          }
        }
        return matches
      }
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
