import React, { useState } from 'react'
import signOutpng from '../../../assets/img/signOut.png'
import copy from '../../../assets/img/copy.png'
import questionMark from '../../../assets/img/questionMark_frame.png'
import { useAppState } from '../../../contexts/providers'
import {
  HeaderWalletBox,
  HeaderWallet,
  WalletList
} from './styled'
import {
  Tooltip 
} from 'antd'

export default () => { 
  const truncatureStr = (str: string): string => {
    return str.slice(0, 10) + '...' + str.slice(-6)
  }

  const [currentTab, setCurrentTab] = useState('balances')
  const {
    counterState: { walletList }
  } = useAppState()
  const tooltip = `A transit address. When you receive CKB from exchanges or CKB wallets with no full address support, please use this address.`
  
  return (
    <HeaderWalletBox>
      <HeaderWallet>Account</HeaderWallet>
      <div className="walletTitle">
        <span>Wallet</span>
        <img src={ signOutpng } alt="signOut" />
      </div>
      <WalletList>
        {
          walletList.map(address => (
            <div className="wallet" key={address}>
              <span className="address">
                <Tooltip title={tooltip} placement="bottom">
                  {truncatureStr(address)}
                </Tooltip>
                <img src={copy} alt="wallet adress copy" />
              </span>
              <img src={questionMark} className="questionMark" alt="question about wallet address" />
            </div>
          ))
        }
      </WalletList>
      {
        currentTab === 'balances' ? (
          <div className="balances"  onClick={() => setCurrentTab('balances')}></div>
        ) : (
          <div className="activites" onClick={() => setCurrentTab('activites')}></div>
        )
      }
    </HeaderWalletBox>
  )
}