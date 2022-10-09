/* eslint-disable react/prop-types */
/* eslint-disable react/no-children-prop */
import Cookies from 'js-cookie'
import { saveAs } from 'file-saver'
import { Suspense } from 'react'
import { useLoaderData, Await, Link } from 'react-router-dom'
import {
  Stack,
  Button,
  LinearProgress,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography
} from '@mui/material'

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
        children={(resolved) => <DataParse data={resolved} />}
      />
    </Suspense>
  )
}

function DataParse({ data }) {
  const champions = JSON.parse(localStorage.getItem('champions'))
  const items = JSON.parse(localStorage.getItem('items'))
  const perks = JSON.parse(localStorage.getItem('perks'))
  const champId = parseInt(Cookies.get('champion'))
  const roleId = Cookies.get('role')
  const puuid = Cookies.get('puuid')
  const parse = new Promise((res) => {
    const statsObj = (obj = {}) => ({
      games: 0,
      wins: 0,
      losses: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      damage: 0,
      level: 0,
      turretKills: 0,
      creepScore: 0,
      ...obj
    })
    const parsed = {
      champion: champions.find(({ id }) => id === champId).label,
      role: roleId === 'UTILITY' ? 'Support' : roleId[0] + roleId.slice(1).toLowerCase(),
      total: statsObj(),
      byPerk: {},
      byMythic: {}
    }
    const addObjects = (obj1, obj2) => {
      const resObj = {}
      Object.keys(obj1).forEach((key) => {
        resObj[key] = obj1[key] + obj2[key]
      })
      return resObj
    }
    data
      .map(({ participants }) => participants.find((p) => p.puuid === puuid))
      .forEach((p) => {
        if (!(p.championId === champId && p.teamPosition === roleId)) return
        const { win, kills, deaths, assists, turretKills } = p
        const results = {
          games: 1,
          wins: +win,
          losses: +!win,
          kills,
          deaths,
          assists,
          turretKills,
          level: p.champLevel,
          damage: p.totalDamageDealtToChampions,
          creepScore: p.totalMinionsKilled
        }
        parsed.total = addObjects(results, parsed.total)
        let mythic = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].find((id) =>
          items.find((item) => parseInt(item.id) === id && item.mythic)
        )
        mythic &&= items.find(({ id }) => parseInt(id) === mythic)?.label
        mythic ??= 'No Mythic'
        const prevMythicStats = parsed.byMythic[mythic] || statsObj()
        parsed.byMythic[mythic] = addObjects(results, prevMythicStats)
        const perk = perks.find(
          ({ id }) => parseInt(id) === p.perks.styles[0].selections[0].perk
        ).label
        const prevPerkStats = parsed.byPerk[perk] || statsObj()
        parsed.byPerk[perk] = addObjects(results, prevPerkStats)
      })
    const avgStats = ({
      games,
      wins,
      losses,
      kills,
      deaths,
      assists,
      turretKills,
      level,
      damage,
      creepScore
    }) => {
      const avg = (stat) => Math.round(stat / games)
      deaths ||= 1
      return {
        games,
        wins,
        losses,
        winrate: Math.round((wins / games) * 100) + '%',
        kills: avg(kills),
        deaths: avg(deaths),
        assists: avg(assists),
        kda: ((kills + assists) / deaths).toFixed(2),
        damage: avg(damage),
        level: avg(level),
        creepScore: avg(creepScore),
        turretKills: avg(turretKills)
      }
    }
    parsed.total = avgStats(parsed.total)
    Object.keys(parsed.byMythic).forEach((key) => {
      parsed.byMythic[key] = avgStats(parsed.byMythic[key])
    })
    Object.keys(parsed.byPerk).forEach((key) => {
      parsed.byPerk[key] = avgStats(parsed.byPerk[key])
    })
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

function DataDisplay({ data }) {
  const createRows = (obj = {}) => Object.keys(obj).map((key) => ({ specifier: key, ...obj[key] }))
  const columns = [
    'Specifier',
    'Games',
    'Wins',
    'Losses',
    'Winrate',
    'Kills',
    'Deaths',
    'Assists',
    'KDA',
    'Damage',
    'Level',
    'CS',
    'Turret Kills'
  ]
  const rows = [
    { specifier: 'All Games', ...data.total },
    ...createRows(data.byMythic),
    ...createRows(data.byPerk)
  ]
  const handleExport = () => {
    const arrToCSV = (arr) => arr.join(',')
    const output = [arrToCSV(columns), ...rows.map((row) => arrToCSV(Object.values(row)))].join(
      '\n'
    )
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'data.csv')
  }
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ paddingBottom: 2 }}>
        <Typography variant="h4">
          {data.champion} | {data.role}
        </Typography>
        {data.total.games > 0 && <Button onClick={handleExport}>Export as CSV</Button>}
      </Box>
      {data.total.games < 1 ? (
        <Typography variant="h6">No Games Found</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="Match Stats">
            <TableHead>
              <TableRow sx={{ background: '#00000011' }}>
                {columns.map((label, i) => (
                  <TableCell key={label} align={i < 1 ? 'left' : 'center'}>
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow
                  key={row.specifier}
                  sx={{ background: i % 2 === 0 ? '#00000002' : '#00000008' }}
                >
                  <TableCell component="th" scope="row">
                    {row.specifier}
                  </TableCell>
                  <TableCell align="center">{row.games}</TableCell>
                  <TableCell align="center">{row.wins}</TableCell>
                  <TableCell align="center">{row.losses}</TableCell>
                  <TableCell align="center">{row.winrate}</TableCell>
                  <TableCell align="center">{row.kills}</TableCell>
                  <TableCell align="center">{row.deaths}</TableCell>
                  <TableCell align="center">{row.assists}</TableCell>
                  <TableCell align="center">{row.kda}</TableCell>
                  <TableCell align="center">{row.damage}</TableCell>
                  <TableCell align="center">{row.level}</TableCell>
                  <TableCell align="center">{row.creepScore}</TableCell>
                  <TableCell align="center">{row.turretKills}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
