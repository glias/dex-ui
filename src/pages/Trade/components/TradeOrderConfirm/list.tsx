import React from 'react'
import { ListContainer } from './styled'

export interface Item {
  desc?: string
  value: string
  unit: string
}

export interface ListProps {
  list: Item[]
  isDeatil?: boolean
}

export const List = ({ list, isDeatil = false }: ListProps) => {
  return (
    <ListContainer className={isDeatil ? 'detail' : ''}>
      {list.map(item => {
        return (
          <div className="item" key={Math.random()}>
            <div className="left">{item.desc ?? ''}</div>
            <div className="right">
              <span className="value">{item.value}</span>
              <span>{item.unit}</span>
            </div>
          </div>
        )
      })}
    </ListContainer>
  )
}
