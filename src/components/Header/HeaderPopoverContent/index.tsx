import React from 'react'
import { Button } from 'antd'
import { useDispatch } from 'react-redux'
import { PopoverBox } from './styled'
import { ConnectLists } from '../../../utils/const'
import { CONNECT_WALLET } from '../../../context/actions/types'

export default () => {
  const dispatch = useDispatch()

  const handleConnect = async () => {
    // connnect wallet...
    // await new PWCore('https://aggron.ckb.dev').init(
    //   new EthProvider(), // a built-in Provider for Ethereum env.
    //   new PwCollector('https://cellapitest.ckb.pw') // a custom Collector to retrive cells from cache server.
    // )
    dispatch({
      type: CONNECT_WALLET,
      payload: {
        walletConnectStatus: 'pedding',
      },
    })
  }

  return (
    <PopoverBox>
      {ConnectLists.map(way => {
        return (
          <Button onClick={() => handleConnect()} key={way.logo}>
            <img src={way.logo} alt="connect logo" />
            {way.name}
          </Button>
        )
      })}
    </PopoverBox>
  )
}
