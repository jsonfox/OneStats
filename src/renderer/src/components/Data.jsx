import { useQuery } from 'react-query'
import { Stack, LinearProgress } from '@mui/material'
import Cookies from 'js-cookie'
import fetchMatches from '../parser'

// eslint-disable-next-line react/prop-types
export default function Data({ onReset = () => null }) {
  const { data, error, isLoading, isRefetching, refetch } = useQuery(
    'data',
    async () => {
      if (data && !inProgress()) return
      const creds = {
        key: Cookies.get('key'),
        puuid: Cookies.get('puuid'),
        region: Cookies.get('region')
      }
      return await fetchMatches(creds)
    },
    { retry: false }
  )

  const inProgress = () => !!(isLoading || isRefetching)

  return inProgress() ? (
    <Stack
      spacing={2}
      sx={{ paddingTop: 8, paddingBottom: 16, textAlign: 'center', alignItems: 'center' }}
    >
      <p>Analyzing your match history...</p>
      <LinearProgress sx={{ width: '60%' }} />
    </Stack>
  ) : data && !error ? (
    <div>
      <button onClick={onReset}>Reset</button>
      <p>{data.length}</p>
    </div>
  ) : (
    <div>
      <button onClick={onReset}>Reset</button>
      <button onClick={refetch}>Retry</button>
    </div>
  )
}
