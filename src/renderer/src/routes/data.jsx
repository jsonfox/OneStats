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
import { SectionRows, SectionDivider } from '../components/Table'

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
          <Stack className="error" sx={{ textAlign: 'center', alignItems: 'center' }}>
            <h2>Ran into an error while loading match data</h2>
            <Button variant="contained" onClick={() => window.location.reload(true)}>
              Reload
            </Button>
            <p>or try resubmitting the {homeBtn}</p>
          </Stack>
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
    const roles = {
      TOP: 'Top',
      JUNGLE: 'Jungle',
      MIDDLE: 'Mid',
      BOTTOM: 'ADC',
      UTILITY: 'Support'
    }
    const parsed = {
      champion: champions.find(({ id }) => id === champId).label,
      role: roles[roleId],
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
  const rows = {
    all: [{ specifier: 'All Games', ...data.total }],
    byMythic: createRows(data.byMythic),
    byPerk: createRows(data.byPerk)
  }
  const handleExport = () => {
    const arrToCSV = (arr) => arr.join(',')
    const output = [
      arrToCSV(columns),
      ...Object.values(rows)
        .flat()
        .map((row) => arrToCSV(Object.values(row)))
    ].join('\n')
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'match-stats.csv')
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Stack direction="row" justifyContent="center" spacing={2} marginBottom={1}>
        <Typography variant="h4">
          {data.champion} | {data.role}
        </Typography>
        {data.total.games > 0 && <Button onClick={handleExport}>Export as CSV</Button>}
      </Stack>
      {data.total.games < 1 ? (
        <Typography variant="h6">No Games Found</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxWidth: 'max-content', marginX: 'auto' }}>
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
              <SectionRows rows={rows.all} />
              <SectionDivider label="By Mythic" columns={columns} />
              <SectionRows rows={rows.byMythic} />
              <SectionDivider label="By Rune" columns={columns} />
              <SectionRows rows={rows.byPerk} />
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
