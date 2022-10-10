import { Box, Button, Typography } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <Box component="header">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button>
          <HomeIcon />
          &nbsp;
          <Typography marginTop="0.22rem">Home</Typography>
        </Button>
      </Link>
      <Typography component="h1" variant="h3" textAlign="center">
        One Stats
      </Typography>
    </Box>
  )
}
