/* eslint-disable react/prop-types */
/* eslint-disable react/no-children-prop */
import { Suspense } from 'react'
import { useLoaderData, Await, Link } from 'react-router-dom'
import { Stack, Button, LinearProgress } from '@mui/material'
import Cookies from 'js-cookie'

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
      total: statsObj(),
      byPerk: {},
      byMythic: {}
    }
    const champions = JSON.parse(localStorage.getItem('champions'))
    const items = JSON.parse(localStorage.getItem('items'))
    const perks = JSON.parse(localStorage.getItem('perks'))
    parsed.champion = champions.find(({ id }) => id === champId).label
    const addObjects = (obj1, obj2) => {
      const resObj = {}
      Object.keys(obj1).forEach((key) => {
        resObj[key] = obj1[key] + obj2[key]
      })
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
        mythic ??= 'none'
        const prevMythicStats = parsed.byMythic[mythic] || statsObj()
        console.log('mythic', prevMythicStats)
        parsed.byMythic[mythic] = addObjects(results, prevMythicStats)
        const perk = perks.find(({ id }) => parseInt(id) === p.perks.styles[0].selections[0].perk)
        const prevPerkStats = parsed.byPerk[perk] || statsObj()
        console.log('perk', prevPerkStats)
        parsed.byPerk[perk] = addObjects(results, prevPerkStats)
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
  console.log(data)
  return <div>Hi</div>
}
