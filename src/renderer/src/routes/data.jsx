/* eslint-disable react/no-children-prop */
import { Suspense } from 'react'
import { useLoaderData, Await } from 'react-router-dom'
import { Stack, Button, LinearProgress } from '@mui/material'

export default function Data() {
  const { key, region, matchIds } = useLoaderData()
  const fetcher = new Promise((res) => {
    setTimeout(() => {
      res(matchIds)
    }, 3000)
  })

  return (
    <Suspense fallback={<Loading />}>
      <Await
        resolve={fetcher}
        errorElement={
          <div className="error">
            <h2>Could not load champion data</h2>
            <Button variant="contained" onClick={() => window.location.reload(true)}>
              Reload
            </Button>
          </div>
        }
        children={(resolved) => <DataDisplay data={resolved} />}
      />
    </Suspense>
  )
}

function Loading() {
  return (
    <Stack
      spacing={2}
      sx={{ paddingTop: 8, paddingBottom: 16, textAlign: 'center', alignItems: 'center' }}
    >
      <p>Analyzing your match history...</p>
      <LinearProgress sx={{ width: '60%' }} />
    </Stack>
  )
}

// eslint-disable-next-line react/prop-types
function DataDisplay({ data }) {
  return <div>{data}</div>
}
