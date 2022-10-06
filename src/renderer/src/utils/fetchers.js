import axios from 'axios'

const getBaseUrl = (region) => {
  const apiRegion = ['na1', 'la1', 'la2', 'br1'].includes(region)
  ? 'americas'
  : ['eun1', 'euw1', 'tr1', 'ru'].includes(region)
  ? 'europe'
  : ['kr', 'jp1'].includes(region)
  ? 'asia'
  : 'sea'
  return `https://${apiRegion}.api.riotgames.com/lol/match/v5/matches/`
}

export async function fetchMatchIds({ key, puuid, region, latest }) {
  const apiUrl = (index) => {
    const baseUrl = getBaseUrl(region)
    const queryParam = `?${
      latest ? `startTime=${latest}` : ''
    }${`type=ranked&start=${index}&count=100&`}api_key=${key}`
    return baseUrl + `by-puuid/${puuid}/ids` + queryParam
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

export async function fetchMatch({ key, matchId, region }) {
  const url = getBaseUrl(region) + matchId + '?api_key=' + key
  return axios.get(url, { mode: 'no-cors' }).then((res) => res.data)
}
