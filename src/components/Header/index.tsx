import React from 'react'
import { useDispatch } from 'react-redux'
import { Button, Menu } from 'antd'
import { useHistory } from 'react-router-dom'
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

import { CONNECT_WALLET } from '../../context/actions/types'
import i18n from '../../utils/i18n'
import { HeaderBox, HeaderPanel, HeaderLogoBox, MenuLiText, HeaderMeta } from './styled'

const HeaderContainer = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const openSideBar = () => {}

  const handleConnect = async () => {
    // connnect wallet...
    const web3Modal = new Web3Modal({
      network: 'mainnet', // optional
      cacheProvider: true, // optional
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider, // required
          options: {
            infuraId: 'INFURA_ID', // required
          },
        },
      },
    })

    const provider = await web3Modal.connect()

    // todoing...
    const web3 = new Web3(provider)

    console.log(web3)

    dispatch({
      type: CONNECT_WALLET,
      payload: {
        walletConnectStatus: 'pedding',
      },
    })
  }

  return (
    <HeaderBox className="header-box">
      <HeaderPanel>
        <div className="panel-nav">
          <HeaderLogoBox>CKB DEX</HeaderLogoBox>
          <Menu mode="horizontal" onClick={e => history.push(`/${e.key}`)}>
            <Menu.Item key="trade">
              <MenuLiText>{i18n.t(`header.Trade`)}</MenuLiText>
            </Menu.Item>
            <Menu.Item key="pool">
              <MenuLiText>{i18n.t(`header.Pool`)}</MenuLiText>
            </Menu.Item>
            <Menu.Item key="match">
              <MenuLiText>{i18n.t(`header.Match`)}</MenuLiText>
            </Menu.Item>
          </Menu>
        </div>
        <HeaderMeta id="headerMeta">
          <Button className="collect-btn" onClick={() => handleConnect()}>
            {i18n.t('header.wallet')}
          </Button>
          <Button onClick={() => openSideBar()}>
            <i className="ai-ellipsis" />
          </Button>
        </HeaderMeta>
      </HeaderPanel>
    </HeaderBox>
  )
}

export default HeaderContainer
