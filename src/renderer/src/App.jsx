import { Form, Versions } from './components'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { CircularProgress, Button } from '@mui/material'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container">
        <Versions />
        <FetchData />
      </div>
    </QueryClientProvider>
  )
}

function FetchData() {
  const { isLoading, error, data } = useQuery(['repoData'], () =>
    fetch(
      'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json'
    ).then((res) => res.json())
  )

  if (isLoading) return <CircularProgress />

  if (error)
    return (
      <div className="error">
        <p>{'An error has occurred: ' + error.message}</p>
        <Button variant="contained" onClick={() => window.location.reload(true)}>
          Reload
        </Button>
      </div>
    )

  const champions = data.slice(1).map(({ id, name }) => ({ label: name, id }))

  return <Form champions={champions} />
}
