/* eslint-disable react/prop-types */
import { TableRow, TableCell } from '@mui/material'

export const SectionRows = ({ rows = [] }) =>
  rows.map((row, i) => (
    <TableRow key={row.specifier} sx={{ background: i % 2 === 0 ? '#00000002' : '#00000008' }}>
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
  ))

export const SectionDivider = ({ label, columns }) => (
  <TableRow sx={{ background: '#00000011' }}>
    <TableCell component="th" scope="row">
      <strong>{label}</strong>
    </TableCell>
    {Array.from(Array(12), (e, i) => (
      <TableCell align="center" key={i}>
        {columns[i + 1]}
      </TableCell>
    ))}
  </TableRow>
)
