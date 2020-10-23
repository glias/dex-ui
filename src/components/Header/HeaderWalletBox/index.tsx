/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState } from 'react'
import { Tooltip } from 'antd'
import signOutpng from '../../../assets/img/signOut.png'
import copy from '../../../assets/img/copy.png'
import questionMark from '../../../assets/img/questionMark_frame.png'
import { HeaderWalletBox, HeaderWallet, WalletList } from './styled'

interface Props {
  disconnect: () => void
  addresses: [string, string]
}

export default function WalletBox({ disconnect, addresses }: Props) {
  const truncatureStr = (str: string): string => {
    return `${str.slice(0, 10)}...${str.slice(-6)}`
  }

  const copyToClipboard = 'Copy'
  const copied = 'Copied!'

  const [clipboardTooltip, setClipboardTooltip] = useState(copyToClipboard)

  // const [currentTab, setCurrentTab] = useState('balances')
  const tooltip = `A transit address. When you receive CKB from exchanges or CKB wallets with no full address support, please use this address.`

  return (
    <HeaderWalletBox>
      <HeaderWallet>Account</HeaderWallet>
      <div className="wallet-title">
        <span>Test Wallet</span>
        <img src={signOutpng} alt="signOut" onClick={disconnect} />
      </div>
      <WalletList>
        {addresses.map(address => (
          <div className="wallet" key={address}>
            <span className="address">
              <Tooltip title={tooltip} placement="bottom">
                {truncatureStr(address)}
              </Tooltip>
              <Tooltip
                title={clipboardTooltip}
                placement="bottom"
                onVisibleChange={visable => visable && setClipboardTooltip(copyToClipboard)}
              >
                <img
                  src={copy}
                  alt="wallet adress copy"
                  onClick={() => {
                    navigator.clipboard.writeText(address)
                    setClipboardTooltip(copied)
                  }}
                />
              </Tooltip>
            </span>
            <img src={questionMark} className="questionMark" alt="question about wallet address" />
          </div>
        ))}
      </WalletList>
    </HeaderWalletBox>
  )
}
