import React from 'react'
import { Button } from 'antd'
import { PopoverBox } from './styled'
import { ConnectLists } from '../../../utils/const'

export default () => {
  return (
    <PopoverBox>
      {ConnectLists.map(way => {
        return (
          <Button key={way.logo}>
            <img src={way.logo} alt="connect logo" />
            {way.name}
          </Button>
        )
      })}
    </PopoverBox>
  )
}
