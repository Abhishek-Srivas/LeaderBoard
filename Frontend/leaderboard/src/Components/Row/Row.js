import React from 'react'
import './Row.css'
const Row = (props) => {
  return (
    <div className='LeaderBoard-Table-Row'>
        <p>{props.rank}</p>
        <p>{props.name}</p>
        <p>{props.points}</p>
    </div>
  )
}

export default Row