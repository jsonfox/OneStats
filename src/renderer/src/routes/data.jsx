/* eslint-disable react/no-children-prop */
import { Suspense } from 'react'
import { useLoaderData, Await } from 'react-router-dom'
import { Stack, Button, LinearProgress } from '@mui/material'

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
        errorElement={(err) => {
          console.error(err)
          return (
            <div className="error">
              <h2>Could not load champion data</h2>
              <Button variant="contained" onClick={() => window.location.reload(true)}>
                Reload
              </Button>
            </div>
          )
        }}
        children={(resolved) => <DataDisplay data={resolved} />}
      />
    </Suspense>
  )
}

// eslint-disable-next-line react/prop-types
function DataDisplay({ data }) {
  console.log(data)
  return <div>{'hi'}</div>
}
