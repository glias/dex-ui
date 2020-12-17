import { MenuOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import MetaMaskLogo from 'assets/img/wallet/metamask.png'
import { getChainData, getProviderOptions } from 'components/Header/chain'
import WalletContainer from 'containers/wallet'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Link, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { ellipsisCenter } from 'utils/common'
import i18n from 'utils/i18n'
import Web3Modal from 'web3modal'

const AppHeaderWrapper = styled.header`
  padding: 0 8px;
  height: 60px;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.theme.primaryColor};

  .logo a {
    font-size: 18px;
    font-style: normal;
    font-weight: 800;
    line-height: 22px;
    letter-spacing: 0em;
    text-align: left;
    color: #ffffff;
  }
`

const ConnectionButton = styled.div`
  background-color: #ffffff;
  color: ${props => props.theme.primaryColor};
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;

  & > * {
    margin: 4px;
  }

  img {
    width: 20px;
    height: 20px;
  }
`

const CLOSE_BY_THE_USER_ERROR_MSG = 'Modal closed by user'
const UNKNOWN_CONNECT_WALLET_FAILED = 'Connect wallet failed, please check wallet settings.'

export const AppHeader = () => {
  const { connectWallet, resetWallet, ckbWallet, connectStatus, web3ModalRef } = WalletContainer.useContainer()
  const history = useHistory()

  const handleWalletConnect = useCallback(() => {
    connectWallet().catch(error => {
      resetWallet()
      if (error === CLOSE_BY_THE_USER_ERROR_MSG) {
        return
      }
      Modal.error({
        title: 'Connection Error',
        content: error?.message ?? error ?? UNKNOWN_CONNECT_WALLET_FAILED,
      })
    })
  }, [connectWallet, resetWallet])

  useEffect(() => {
    const modal = new Web3Modal({
      network: getChainData(1).network,
      cacheProvider: true,
      providerOptions: getProviderOptions(),
    })

    web3ModalRef.current = modal

    if (modal.cachedProvider) {
      handleWalletConnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connectButtonElement = useMemo(() => {
    if (connectStatus === 'connected')
      return (
        <ConnectionButton onClick={() => history.push('/assets')}>
          <span>
            <img src={MetaMaskLogo} alt="metamask" />
          </span>
          <span>{ellipsisCenter(ckbWallet.address, 6, 4)}</span>
          <MenuOutlined translate="menu" />
        </ConnectionButton>
      )

    if (connectStatus === 'connecting') return <ConnectionButton>{i18n.t('header.connecting')}</ConnectionButton>

    return <ConnectionButton onClick={handleWalletConnect}>{i18n.t('header.wallet')}</ConnectionButton>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectStatus])

  return (
    <AppHeaderWrapper>
      <div className="logo">
        <Link to="/">GLIASWAP</Link>
      </div>
      {connectButtonElement}
    </AppHeaderWrapper>
  )
}
