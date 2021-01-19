import React from 'react'
import { Tooltip } from 'antd'
import { ListContainer } from './styled'

export interface Item {
  desc?: string
  tooltip?: string
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
            <div className="left">
              {item.desc ?? ''}
              &nbsp;
              {item.tooltip ? (
                <Tooltip title={item.tooltip}>
                  <i className="ai-question-circle-o" />
                </Tooltip>
              ) : null}
            </div>
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
