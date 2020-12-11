import { MenuOutlined } from '@ant-design/icons'
import PWCore from '@lay2/pw-core'
import { Button, Menu, Modal, Popover } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useContainer } from 'unstated-next'
import Web3Modal from 'web3modal'
import MetaMaskpng from '../../assets/img/wallet/metamask.png'
import WalletContainer from '../../containers/wallet'
import { useDidMount } from '../../hooks'
import i18n from '../../utils/i18n'
import { AssetManager } from './AssetsManager'
import { getChainData, getProviderOptions } from './chain'
import { HeaderBox, HeaderContainer, HeaderLogoBox, HeaderMeta, HeaderPanel, MenuLiText, UserMeta } from './styled'

const CLOSE_BY_THE_USER_ERROR_MSG = 'Modal closed by user'
const UNKNOWN_CONNECT_WALLET_FAILED = 'Connect wallet failed, please check wallet settings.'

const Header = () => {
  const history = useHistory()
  const Wallet = useContainer(WalletContainer)
  const { pathname } = useLocation()

  const { ckbWallet, connectStatus } = Wallet
  const ckbAddress = ckbWallet.address

  const truncateStr = (str: string): string => {
    return str?.length >= 5 ? `${str.slice(0, 5)}...${str.slice(-5)}` : ''
  }

  const [visibleWallet, setVisibleWallet] = useState(false)

  const { connectWallet, resetWallet, web3ModalRef, ethWallet, web3, connecting, reloadWallet } = Wallet

  const handleWalletConnect = useCallback(
    () =>
      connectWallet().catch(error => {
        resetWallet()
        if (error === CLOSE_BY_THE_USER_ERROR_MSG) {
          return
        }
        Modal.error({
          title: 'Connection Error',
          content: error?.message ?? error ?? UNKNOWN_CONNECT_WALLET_FAILED,
        })
      }),
    [connectWallet, resetWallet],
  )

  useEffect(() => {
    if (!ckbAddress) setVisibleWallet(false)
  }, [ckbAddress])

  useDidMount(() => {
    web3ModalRef.current = new Web3Modal({
      network: getChainData(1).network,
      cacheProvider: true,
      providerOptions: getProviderOptions(),
    })

    if (web3ModalRef.current.cachedProvider) {
      handleWalletConnect()
    }
  })

  useEffect(() => {
    const INTERVAL_TIME = 10000
    const interval = setInterval(() => {
      const address = PWCore.provider?.address?.toCKBAddress?.() ?? ''
      if (connecting === false && address) {
        reloadWallet(address, ethWallet.address, web3!)
      }
    }, INTERVAL_TIME)

    return () => {
      clearInterval(interval)
    }
  }, [ethWallet.address, web3, connecting, reloadWallet])

  const gotoHome = () => {
    history.push('/')
  }

  return (
    <HeaderContainer>
      <HeaderBox className="header-box">
        <HeaderPanel>
          <HeaderLogoBox onClick={gotoHome}>GLIASWAP</HeaderLogoBox>
          <Menu
            defaultSelectedKeys={[pathname.substring(1) || 'trade']}
            mode="horizontal"
            className="menu"
            onClick={e => history.push(`/${e.key}`)}
          >
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
          <HeaderMeta id="header-meta">
            {connectStatus !== 'connected' ? (
              <Button className="btn-connect" onClick={handleWalletConnect} disabled={Wallet.connecting}>
                {Wallet.connecting ? i18n.t('header.connecting') : i18n.t('header.wallet')}
              </Button>
            ) : (
              <>
                <Popover
                  placement="bottomRight"
                  title=""
                  overlayClassName="popover-wallet"
                  trigger="click"
                  visible={visibleWallet}
                  onVisibleChange={() => setVisibleWallet(!visibleWallet)}
                  getPopupContainer={() => document.getElementById('header-meta') as HTMLElement}
                  content={<AssetManager />}
                >
                  <UserMeta>
                    <img src={MetaMaskpng} alt="metaMask" />
                    {truncateStr(ckbAddress)}
                    <MenuOutlined style={{ marginLeft: '10px' }} translate="more" />
                  </UserMeta>
                </Popover>
              </>
            )}
          </HeaderMeta>
        </HeaderPanel>
      </HeaderBox>
    </HeaderContainer>
  )
}

export default Header
