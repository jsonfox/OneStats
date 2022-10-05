import { Stack, Autocomplete, TextField, Button, CircularProgress } from '@mui/material'
import { useState, useReducer } from 'react'
import { useQuery } from 'react-query'
import Cookies from 'js-cookie'

// eslint-disable-next-line react/prop-types
export default function Form({ onSubmit = () => console.log('Submitted') }) {
  // TODO: Add modal with instructions for obtaining an API key
  const { isLoading, error, data } = useQuery(['champData'], () =>
    fetch(
      'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json'
    ).then((res) => res.json())
  )

  const [formInput, setFormInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    key: Cookies.get('key'),
    summoner: Cookies.get('summoner'),
    region: Cookies.get('region'),
    champion: '',
    role: ''
  })

  const [formError, setFormError] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

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

  const defaultValues = {
    key: Cookies.get('key') || '',
    summoner: Cookies.get('summoner') || '',
    region: Cookies.get('region') || null
  }

  const errorText = 'Request failed, make sure your API key and summoner details are correct'

  const handleInput = (e, val) => {
    e.preventDefault()
    const name = e.target?.id.split('-')[0]
    val ??= e.target.value
    if (!(name && val)) return
    setFormInput({ [name]: val.id || val })
  }

  const summonerAPI = ({ region, summoner, key }) =>
    `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summoner}?api_key=${key}`

  const validateCredentials = async () => {
    try {
      const url = summonerAPI(formInput)
      const res = await fetch(url)
      const summonerData = await res.json()
      return summonerData.puuid
    } catch (err) {
      setFormError(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(false)
    setFormLoading(true)
    const puuid = await validateCredentials()
    setFormLoading(false)
    if (!puuid) return
    Object.keys(formInput).forEach((k) => {
      const maxAge = k === 'key' ? `; Max-Age=${1000 * 60 * 60 * 20}` : ''
      document.cookie = `${k.toLowerCase()}=${formInput[k]}; SameSite; Secure${maxAge}`
    })
    document.cookie = `puuid=${puuid}; SameSite; Secure; Max-Age=${1000 * 60 * 60 * 20}`
    onSubmit()
  }

  const champions = data.slice(1).map(({ id, name }) => ({ label: name, id }))
  const regions = ['na1', 'eun1', 'euw1', 'kr', 'la1', 'la2', 'br1', 'jp1', 'oc1', 'ru', 'tr1']
  const roles = ['Top', 'Jungle', 'Middle', 'Bottom', 'Support'].map((r) => ({
    label: r,
    id: r === 'Support' ? 'UTILITY' : r.toUpperCase()
  }))

  const validOption = (option, value) => option === value || option.id === value.id || value === ''

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3} sx={{ maxWidth: '400px', margin: 'auto' }}>
        <TextField
          label="Developer API Key"
          id="key"
          defaultValue={defaultValues['key']}
          onChange={handleInput}
          error={formError}
          helperText={formError ? errorText : ''}
          required
        />
        <Stack direction="row" spacing={2}>
          <TextField
            label="Summoner Name"
            id="summoner"
            defaultValue={defaultValues['summoner']}
            onChange={handleInput}
            error={formError}
            required
          />
          <Autocomplete
            id="region"
            defaultValue={defaultValues['region']}
            onChange={handleInput}
            options={regions}
            getOptionLabel={(o) => o.toUpperCase()}
            isOptionEqualToValue={validOption}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Region"
                sx={{ minWidth: '175px' }}
                error={formError}
                required
              />
            )}
          />
        </Stack>
        <Autocomplete
          id="champion"
          onChange={handleInput}
          options={champions}
          isOptionEqualToValue={validOption}
          renderInput={(params) => <TextField {...params} label="Champion" required />}
        />
        <Autocomplete
          id="role"
          onChange={handleInput}
          options={roles}
          isOptionEqualToValue={validOption}
          renderInput={(params) => <TextField {...params} label="Role" required />}
        />
        <Button type="submit" variant="contained">
          {formLoading ? <CircularProgress /> : 'Get Your Stats'}
        </Button>
      </Stack>
    </form>
  )
}
