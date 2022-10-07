import axios from 'axios'

const getRegion = (code) =>
  ['na1', 'la1', 'la2', 'br1'].includes(code)
    ? 'americas'
    : ['eun1', 'euw1', 'tr1', 'ru'].includes(code)
    ? 'europe'
    : ['kr', 'jp1'].includes()
    ? 'asia'
    : 'sea'

export async function getMatchIds({ key, puuid, region, latest }) {
  const regionRoute = getRegion(region)
  const apiUrl = (index) => {
    const queryParam = `?${
      latest ? `startTime=${latest}` : ''
    }${`type=ranked&start=${index}&count=100&`}api_key=${key}`
    return (
      `https://${regionRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids` +
      queryParam
    )
  }
  const ids = []
  let index = 0
  while (index < 1000) {
    const url = apiUrl(index)
    const res = await axios.get(url, { mode: 'no-cors' })
    const matchIds = res.data
    if (matchIds.length < 1) index = 1000
    ids.splice(-1, 0, ...matchIds)
    index += 100
  }
  if (ids.length < 1) return new Error()
  return ids
}

export function getMatch({ key, region, id }) {
  return axios.get(
    `https://${getRegion(region)}.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${key}`,
    { mode: 'no-cors' }
  )
}
