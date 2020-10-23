import React from 'react'
import { Button } from 'antd'
import { PopoverBox } from './styled'
import { ConnectLists } from '../../../utils/const'
// import PWCore, {
//   EthProvider,
//   PwCollector
// } from '@lay2/pw-core'

export default () => {
  const handleConnect = async () => {
    // connnect wallet...
    // await new PWCore('https://aggron.ckb.dev').init(
    //   new EthProvider(), // a built-in Provider for Ethereum env.
    //   new PwCollector('https://cellapitest.ckb.pw') // a custom Collector to retrive cells from cache server.
    // )

    // if failed
    // store.dispatch({
    //   type: PageAction.ConnectWallet,
    //   payload: {
    //     walletConnectStatus: 'failed'
    //   }
    // })


    // if connecting...
    // store.dispatch({
    //   type: PageAction.ConnectWallet,
    //   payload: {
    //     walletConnectStatus: 'pedding'
    //   }
    // })



    // if success
    // store.dispatch({
    //   type: PageAction.ConnectWallet,
    //   payload: {
    //     walletConnectStatus: 'success'
    //   }
    // })
  }

  // store.subscribe(() => console.info(store.getState()))

  return (
    <PopoverBox>
      {ConnectLists.map(way => {
        return (<Button onClick={() => handleConnect()} key={way.logo}>
          <img src={way.logo} alt="connect logo" />
          {way.name}
        </Button>
        )
      })}
    </PopoverBox>
  )
}
