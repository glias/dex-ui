import React, { useCallback, useState } from 'react'
import { useContainer } from 'unstated-next'
import Web3Modal from 'web3modal'
import { useHistory } from 'react-router-dom'
import { Button, Popover, Menu, Badge } from 'antd'
import WalletBox from './HeaderWalletBox'
import { ReactComponent as HeaderMoreSVG } from '../../assets/svg/more.svg'
import { ReactComponent as HeaderMetaSVG } from '../../assets/svg/Component12.svg'
import i18n from '../../utils/i18n'
import { thirdPartyLinks } from '../../utils/const'
import MetaMaskpng from '../../assets/img/wallet/metamask.png'
import {
  HeaderBox,
  HeaderPanel,
  HeaderLogoBox,
  MenuLiText,
  HeaderMeta,
  UserMeta,
  ButtonSvgBox,
  ButtonWalletSvgBox,
} from './styled'
import { getChainData, getProviderOptions } from './chain'
import WalletContainer from '../../containers/wallet'
import { useDidMount } from '../../hooks'

const Header = () => {
  const history = useHistory()
  const Wallet = useContainer(WalletContainer)

  const { ckbWallet, ethWallet } = Wallet
  const ckbAddress = ckbWallet.address
  const ethAddress = ethWallet.address

  const truncatureStr = (str: string): string => {
    return str?.length >= 5 ? `${str.slice(0, 5)}...${str.slice(-5)}` : ''
  }

  // propver visible config
  const [visibleMore, setVisibleMore] = useState(false)
  const [visibleWallet, setVisibleWallet] = useState(false)

  const { web3ModalRef } = Wallet
  const { connectWallet, disconnectWallet } = Wallet

  useDidMount(() => {
    web3ModalRef.current = new Web3Modal({
      network: getChainData(1).network,
      cacheProvider: true,
      providerOptions: getProviderOptions(),
    })

    if (web3ModalRef.current.cachedProvider) {
      connectWallet()
    }
  })

  const sideBarContent = (
    <div className="sidebar-content">
      <div className="sidebar-title">{i18n.t('header.more')}</div>
      {thirdPartyLinks.map(item => (
        <Button type="text" onClick={() => window.open(item.link)} key={item.name}>
          {item.name}
        </Button>
      ))}
    </div>
  )

  const disconnect = useCallback(() => {
    disconnectWallet(() => setVisibleWallet(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disconnectWallet])

  return (
    <HeaderBox className="header-box">
      <HeaderPanel>
        <HeaderLogoBox>CKB DEX</HeaderLogoBox>
        <Menu
          defaultSelectedKeys={['trade', '']}
          mode="horizontal"
          className="menuBox"
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
          {ckbAddress === '' ? (
            <Button className="collect-btn" onClick={connectWallet} disabled={Wallet.connecting}>
              {Wallet.connecting ? i18n.t('header.connecting') : i18n.t('header.wallet')}
            </Button>
          ) : (
            <>
              <UserMeta>
                <img src={MetaMaskpng} alt="metaMask" />
                {truncatureStr(ethAddress)}
              </UserMeta>
              <Popover
                placement="bottomRight"
                title=""
                overlayClassName="no-arrorPoint popover-wallet"
                trigger="click"
                visible={visibleWallet}
                onVisibleChange={() => setVisibleWallet(!visibleWallet)}
                getPopupContainer={() => document.getElementById('header-meta') as HTMLElement}
                content={<WalletBox disconnect={disconnect} addresses={[ckbAddress, ethAddress]} />}
              >
                <Badge count="">
                  <Button
                    className="btn-meta"
                    style={{
                      background: visibleWallet ? '#fff' : 'rgba(0,106,151,1)',
                    }}
                  >
                    <ButtonWalletSvgBox>
                      <HeaderMetaSVG className="full" color={visibleWallet ? 'rgba(0,106,151,1)' : '#fff'} />
                    </ButtonWalletSvgBox>
                  </Button>
                </Badge>
              </Popover>
            </>
          )}
          <Popover
            placement="bottomRight"
            title=""
            content={sideBarContent}
            trigger="click"
            visible={visibleMore}
            onVisibleChange={() => setVisibleMore(!visibleMore)}
            overlayClassName="sidebarBox no-arrorPoint"
            getPopupContainer={() => document.getElementById('header-meta') as HTMLElement}
          >
            <Button
              className="btn-meta"
              style={{
                borderRadius: '10px',
                background: visibleMore ? '#fff' : 'rgba(0,106,151,1)',
                marginLeft: '5px',
              }}
            >
              <ButtonSvgBox color={visibleMore ? 'rgba(0,106,151,1)' : '#fff'}>
                <HeaderMoreSVG className="full" />
              </ButtonSvgBox>
            </Button>
          </Popover>
        </HeaderMeta>
      </HeaderPanel>
    </HeaderBox>
  )
}

export default Header
