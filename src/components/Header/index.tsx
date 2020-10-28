import React, { useRef, useState } from 'react'
import PWCore, {
  Amount,
  Web3ModalProvider,
  // EthSigner,
} from '@lay2/pw-core'
import Web3 from 'web3'
import { useContainer } from 'unstated-next'
import Web3Modal from 'web3modal'
import { useHistory } from 'react-router-dom'
import { Button, Popover, Menu, Badge } from 'antd'
import WalletBox from './HeaderWalletBox'
import { ReactComponent as HeaderMoreSVG } from '../../assets/svg/more.svg'
import { ReactComponent as HeaderMetaSVG } from '../../assets/svg/Component12.svg'
import i18n from '../../utils/i18n'
import { CKB_NODE_URL, thirdPartyLinks } from '../../utils/const'
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

const { SDCollector } = require('./sd-collector')

const Header = () => {
  const history = useHistory()
  const Wallet = useContainer(WalletContainer)

  const { ckbWallet, ethWallet } = Wallet
  const ckbAddress = ckbWallet.address
  const ethAddress = ethWallet.address
  const [hasLogin, setHasLogin] = useState(false)

  const truncatureStr = (str: string): string => {
    return str?.length >= 5 ? `${str.slice(0, 5)}...${str.slice(-5)}` : ''
  }

  // propver visible config
  const [visibleMore, setVisibleMore] = useState(false)
  const [visibleWallet, setVisibleWallet] = useState(false)

  const web3Modal = useRef<Web3Modal | null>(null)

  const connectWallet = async () => {
    const provider = await web3Modal.current!.connect()
    const web3 = new Web3(provider)
    const pw = await new PWCore(CKB_NODE_URL).init(new Web3ModalProvider(web3), new SDCollector() as any)
    const [ethAddr] = await web3.eth.getAccounts()
    const ckbAddr = PWCore.provider.address.toCKBAddress()

    Wallet.setWeb3(web3)
    Wallet.setPw(pw)
    setHasLogin(true)

    const ethBalance = await web3.eth.getBalance(ethAddr)
    Wallet.setEthBalance(new Amount(ethBalance))
    Wallet.setEthAddress(ethAddr.toLowerCase())
    await Wallet.reloadCkbWallet(ckbAddr)
  }

  const disconnectWallet = async () => {
    await PWCore.provider.close()
    await web3Modal.current!.clearCachedProvider()
    Wallet.setCkbAddress('')
    Wallet.setEthAddress('')
    setHasLogin(false)
    setVisibleWallet(false)
  }

  useDidMount(() => {
    web3Modal.current = new Web3Modal({
      network: getChainData(1).network,
      cacheProvider: true,
      providerOptions: getProviderOptions(),
    })

    if (web3Modal.current.cachedProvider) {
      setHasLogin(true)
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

  return (
    <HeaderBox className="header-box">
      <HeaderPanel>
        <HeaderLogoBox>CKB DEX</HeaderLogoBox>
        <Menu mode="horizontal" className="menuBox" onClick={e => history.push(`/${e.key}`)}>
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
            <Button className="collect-btn" onClick={connectWallet} disabled={hasLogin}>
              {hasLogin ? i18n.t('header.connecting') : i18n.t('header.wallet')}
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
                content={<WalletBox disconnect={disconnectWallet} addresses={[ckbAddress, ethAddress]} />}
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
