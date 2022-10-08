/* eslint-disable react/no-children-prop */
import { Suspense } from 'react'
import { useLoaderData, Await, Link } from 'react-router-dom'
import { Stack, Button, LinearProgress } from '@mui/material'
import Cookies from 'js-cookie'

const homeBtn = <Link to="/">form</Link>

export default function Data() {
  const { count, data } = useLoaderData()

  return (
    <Suspense
      fallback={
        <Stack
          spacing={2}
          sx={{ paddingTop: 8, paddingBottom: 16, textAlign: 'center', alignItems: 'center' }}
        >
          <p>Fetching {count} games from your match history...</p>
          <p>
            This may take a long time (up to 20 minutes) depending on how many matches there are
            (max 1000)
            <br />
            This is because the API key is rate limited to 100 requests per 2 minutes
          </p>
          <LinearProgress sx={{ width: '60%' }} />
        </Stack>
      }
    >
      <Await
        resolve={data()}
        errorElement={
          <div className="error">
            <h2>Could not fetch match data</h2>
            <Button variant="contained" onClick={() => window.location.reload(true)}>
              Reload
            </Button>
            <p>or try resubmitting the {homeBtn}</p>
          </div>
        }
        children={(resolved) => <DataParse matches={resolved} />}
      />
    </Suspense>
  )
}

// eslint-disable-next-line react/prop-types
function DataParse({ matches }) {
  const champId = Cookies.get('champion')
  const roleId = Cookies.get('role')
  const parse = new Promise((res) => {
    const statObj = () => ({
      games: 0,
      wins: 0,
      losses: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      duration: 0,
      level: 0
    })
    const parsed = {
      total: statObj(),
      byRune: {},
      byMythic: {}
    }

    res(parsed)
  })
  return (
    <Suspense
      fallback={
        <Stack
          spacing={2}
          sx={{ paddingTop: 8, paddingBottom: 16, textAlign: 'center', alignItems: 'center' }}
        >
          <p>Parsing the match data...</p>
          <LinearProgress sx={{ width: '60%' }} />
        </Stack>
      }
    >
      <Await resolve={parse} children={(resolved) => <DataDisplay data={resolved} />} />
    </Suspense>
  )
}

// eslint-disable-next-line react/prop-types
function DataDisplay({ data }) {
  return <div>Hi</div>
}
