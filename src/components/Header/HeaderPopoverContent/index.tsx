import React from 'react'
import { Button } from 'antd'
import { PopoverBox } from './styled'
import { ConnectLists } from '../../../utils/const'

export default () => {
  const handleConnect = async () => {
    // connnect wallet...
    // todo...

    // if failed
    // store.dispatch({
    //   type: PageAction.ConnectWallet,
    //   payload: {
    //     isConnectWallet: false
    //   }
    // })

    // if success
    // store.dispatch({
    //   type: PageAction.ConnectWallet,
    //   payload: {
    //     isConnectWallet: true
    //   }
    // })
  }

  // store.subscribe(() => console.info(store.getState()))

  return (
    <PopoverBox>
      {ConnectLists.map(way => (
        <React.Fragment key={way.logo}>
          <Button onClick={() => handleConnect()}>
            <img src={way.logo} alt="connect logo" />
            {way.name}
          </Button>
        </React.Fragment>
      ))}
    </PopoverBox>
  )
}
