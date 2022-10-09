import Cookies from 'js-cookie'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Typography, Box, Stack, Button } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import { get as idbGet, set as idbSet } from 'idb-keyval'
import { getMatchIds, getMatch, getAssetData } from './utils/fetchers'
import { Form, Data } from './routes'
import { Versions } from './components'

const router = createBrowserRouter([
  {
    element: <Form />,
    path: '/',
    loader: async () => {
      return {
        champions: getAssetData('champions', localStorage),
        items: getAssetData('items', localStorage),
        perks: getAssetData('perks', localStorage)
      }
    }
  },
  {
    element: <Data />,
    path: 'data',
    loader: async () => {
      const puuid = Cookies.get('puuid')
      let userData = await idbGet(puuid)
      userData &&= JSON.parse(userData)
      userData ??= {
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
          await idbSet(puuid, JSON.stringify(userData))
        } catch (err) {
          console.error(err)
        }
        return userData.matches
      }
      return { data, count: matchIds.length }
    }
  }
])

export default function App() {
  return (
    <Stack sx={{ height: '100vh' }}>
      <Box component="header">
        <Button href="/">
          <HomeIcon />
          &nbsp;
          <Typography marginTop="0.22rem">Home</Typography>
        </Button>
        <Typography component="h1" variant="h3" textAlign="center">
          One Stats
        </Typography>
      </Box>
      <Box component="main" className="container" sx={{ paddingY: 5, flexGrow: 1 }}>
        <RouterProvider router={router} />
      </Box>
      <Box component="footer">
        <Versions />
      </Box>
    </Stack>
  )
}
