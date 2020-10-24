/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState } from 'react'
import { Button, Tooltip } from 'antd'
import { useContainer } from 'unstated-next'
import WalletContainer from '../../../containers/wallet'
import signOutpng from '../../../assets/img/signOut.png'
import copy from '../../../assets/img/copy.png'
import questionMark from '../../../assets/img/questionMark_frame.png'
import toExplorer from '../../../assets/img/toExplorer.png'
import { PairList } from '../../../utils/const'
import { HeaderBox, HeaderPanel, HeaderMeta, HeaderWalletBox, HeaderWallet, WalletList } from './styled'

interface Props {
  disconnect: () => void
  addresses: [string, string]
}

export default function WalletBox({ disconnect, addresses }: Props) {
  const Wallet = useContainer(WalletContainer)
  const { ckbWallet, ethWallet } = Wallet

  const truncatureStr = (str: string): string => {
    return str.length > 10 ? `${str.slice(0, 10)}...${str.slice(-10)}` : str
  }

  const balancesListWapper = [
    {
      ...ckbWallet,
      name: 'CKB',
    },
    {
      ...ethWallet,
      name: 'ETH',
    },
  ].map(item => {
    const index: number = PairList.findIndex(pair => pair.name === item.name)

    return {
      ...item,
      logo: index >= 0 ? PairList[index].logo : null,
    }
  })

  const copyToClipboard = 'Copy'
  const copied = 'Copied!'

  const [clipboardTooltip, setClipboardTooltip] = useState(copyToClipboard)

  const validityText = (value: number) => (value >= 0 ? (value / 10 ** 8).toString() : '--')

  const walletFlexBox = (item: any) => {
    return (
      <div className="balance-item">
        <div className="balance-name">{item.name}</div>
        <div
          className="balance-price"
          style={{
            textAlign: 'right',
            alignItems: 'revert',
          }}
        >
          <div className="total-num">{validityText(item.balance?.amount)}</div>
          <div className="price">
            <span>$ 0.00</span>
          </div>
        </div>
      </div>
    )
  }

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
              {truncatureStr(address)}
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
            <Tooltip title={tooltip} placement="bottom">
              <img src={questionMark} className="questionMark" alt="question about wallet address" />
            </Tooltip>
          </div>
        ))}
      </WalletList>
      <HeaderBox className="header-box">
        <HeaderPanel>
          <HeaderMeta id="header-meta">
            <div className="popover-wallet-box">
              <div className="balances">
                <h4
                  style={{
                    marginLeft: '10px',
                  }}
                >
                  Balances
                </h4>
                <div className="divider" />
                <ul>
                  {balancesListWapper.map(item => (
                    <li key={item.name}>
                      <div
                        className="logo"
                        style={{
                          marginTop: item.name === 'CKB' ? '10px' : 0,
                        }}
                      >
                        {item.logo ? <img src={item.logo} alt="logo" /> : ''}
                      </div>
                      <div className="wallet-info">{walletFlexBox(item)}</div>
                      <div className="explorer">
                        <Button
                          type="text"
                          size="small"
                          onClick={() => window.open(`https://explorer.nervos.org/aggron/address/${item.address}`)}
                        >
                          <img src={toExplorer} alt="explorer" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </HeaderMeta>
        </HeaderPanel>
      </HeaderBox>
    </HeaderWalletBox>
  )
}
