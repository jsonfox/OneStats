import Cookies from 'js-cookie'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Typography, Box } from '@mui/material'
import { getMatchIds, getMatch } from './utils/fetchers'
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
      const puuid = Cookies.get('puuid')
      const localData = localStorage.getItem(puuid) ? JSON.parse(localStorage.getItem(puuid)) : null
      const userData = localData || {
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

      const data = async function fetchAllMatches() {
        const matches = []
        for (const [i, id] of matchIds.entries()) {
          console.log(`Fetching match ${i + 1} of ${matchIds.length}`)
          let retry = true
          let retryCount = 0
          while (retry && retryCount < 5) {
            try {
              if (retryCount > 0) console.log('Retrying match', i)
              const res = await getMatch({ key, region, id })
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
        console.log('Fetching complete')
        try {
          const latestMatch = matches.at(-1)?.gameEndTimestamp
          if (latestMatch) userData.latest = latestMatch
          userData.matches = userData.matches
            .concat(matches)
            .filter(
              (value, index, self) =>
                index === self.findIndex((match) => match.gameId === value.gameId)
            )
          localStorage.setItem(puuid, JSON.stringify(userData))
        } catch (err) {
          console.error(err)
        }
        return matches
      }
      return { data, count: matchIds.length }
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
