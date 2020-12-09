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
        let className = ''
        const isFree = item.unit === 'free-now'
        if (item.unit) {
          className = isFree ? item.unit : 'value'
        }
        return (
          <div className="item" key={Math.random()}>
            <div className="left">{item.desc ?? ''}</div>
            <div className="right">
              <span className={className}>{item.value}</span>
              {item.unit && !isFree ? <span>{item.unit}</span> : null}
            </div>
          </div>
        )
      })}
    </ListContainer>
  )
}
