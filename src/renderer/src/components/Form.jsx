import { Stack, Autocomplete, TextField, Button } from '@mui/material'

export default function Form({ champions }) {
  return (
    <Stack>
      <Autocomplete
        options={champions}
        renderInput={(params) => <TextField {...params} label="Champions" />}
      />
    </Stack>
  )
}
