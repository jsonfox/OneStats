import { useState } from 'react'
import { Stack } from '@mui/system'

export default function Versions() {
  const [versions] = useState(window.electron.process.versions)

  return (
    <Stack component="ul" className="versions" direction="row" spacing={6} justifyContent="center">
      <li className="app-version">OneStats v1.0.0</li>
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
      <li className="v8-version">V8 v{versions.v8}</li>
    </Stack>
  )
}
