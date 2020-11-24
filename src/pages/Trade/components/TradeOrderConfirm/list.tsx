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
              <span className={item.unit ? 'value' : ''}>{item.value}</span>
              {item.unit ? <span>{item.unit}</span> : null}
            </div>
          </div>
        )
      })}
    </ListContainer>
  )
}
