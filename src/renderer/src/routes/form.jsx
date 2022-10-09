/* eslint-disable react/no-children-prop */
import Cookies from 'js-cookie'
import { useState, useReducer, Suspense } from 'react'
import { Navigate, useLoaderData, Await } from 'react-router-dom'
import { Stack, Autocomplete, TextField, Button, Skeleton, CircularProgress } from '@mui/material'

const regions = [
  { label: 'NA', id: 'na1' },
  { label: 'EUNE', id: 'eun1' },
  { label: 'EUW', id: 'euw1' },
  { label: 'KR', id: 'kr' },
  { label: 'LAN', id: 'la1' },
  { label: 'LAS', id: 'la2' },
  { label: 'BR', id: 'br1' },
  { label: 'JP', id: 'jp1' },
  { label: 'OCE', id: 'oc1' },
  { label: 'RU', id: 'ru' },
  { label: 'TR', id: 'tr1' }
]
const roles = ['Top', 'Jungle', 'Middle', 'Bottom', 'Support'].map((r) => ({
  label: r,
  id: r === 'Support' ? 'UTILITY' : r.toUpperCase()
}))

export default function Form() {
  // TODO: Add link to instructions for obtaining an API key
  const { champions } = useLoaderData()

  const [formInput, setFormInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    key: Cookies.get('key'),
    summoner: Cookies.get('summoner'),
    region: Cookies.get('region'),
    champion: '',
    role: ''
  })

  const [formError, setFormError] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const defaultValues = {
    key: Cookies.get('key') || '',
    summoner: Cookies.get('summoner') || '',
    region: regions.findIndex(({ id }) => id === Cookies.get('region'))
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
    const cookieOptions = { sameSite: 'lax', secure: true }
    Object.keys(formInput).forEach((k) => {
      if (k === 'key') {
        if (Cookies.get('key') !== formInput.key)
          Cookies.set('key', formInput.key, { expires: 0.8, ...cookieOptions })
      } else {
        Cookies.set(k.toLowerCase(), formInput[k], cookieOptions)
      }
    })
    Cookies.set('puuid', puuid)
    setSubmitted(true)
  }

  const validOption = (option, value) => option === value || option.id === value.id || value === ''

  return submitted ? (
    <Navigate to="/data" replace={true} />
  ) : (
    <Suspense fallback={<FormSkeleton />}>
      <Await
        resolve={champions}
        errorElement={
          <div className="error">
            <h2>Could not load champion data</h2>
            <Button variant="contained" onClick={() => window.location.reload(true)}>
              Reload
            </Button>
          </div>
        }
        children={(resChamps) => (
          <form onSubmit={handleSubmit}>
            <Stack spacing={3} sx={{ maxWidth: '400px', margin: 'auto' }}>
              <TextField
                label="Developer API Key"
                id="key"
                type="password"
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
                  defaultValue={regions[defaultValues['region']]}
                  onChange={handleInput}
                  options={regions}
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
                options={resChamps}
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
        )}
      />
    </Suspense>
  )
}

function FormSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rectangular" width={210} height={118} />
    </Stack>
  )
}
