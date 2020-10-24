import React, { useRef } from 'react'
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
import i18n from '../../utils/i18n'
import { thirdPartyLinks } from '../../utils/const'
import MetaMaskpng from '../../assets/img/wallet/metamask.png'
import outlined from '../../assets/img/outlined.png'
import { HeaderBox, HeaderPanel, HeaderLogoBox, MenuLiText, HeaderMeta, UserMeta } from './styled'
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

  const truncatureStr = (str: string): string => {
    return str?.length >= 5 ? `${str.slice(0, 5)}...${str.slice(-5)}` : ''
  }

  const web3Modal = useRef<Web3Modal | null>(null)

  const connectWallet = async () => {
    const provider = await web3Modal.current!.connect()
    const web3 = new Web3(provider)
    const pw = await new PWCore('https://aggron.ckb.dev').init(new Web3ModalProvider(web3), new SDCollector() as any)
    const [ethAddr] = await web3.eth.getAccounts()
    const ckbAddr = PWCore.provider.address.toCKBAddress()

    Wallet.setWeb3(web3)
    Wallet.setPw(pw)

    await Wallet.reloadCkbWallet(ckbAddr)
    const ethBalance = await web3.eth.getBalance(ethAddr)
    Wallet.setEthBalance(new Amount(ethBalance))
    Wallet.setEthAddress(ethAddr.toLowerCase())
  }

  const disconnectWallet = async () => {
    await PWCore.provider.close()
    await web3Modal.current!.clearCachedProvider()
    Wallet.setCkbAddress('')
    Wallet.setEthAddress('')
  }

  useDidMount(() => {
    web3Modal.current = new Web3Modal({
      network: getChainData(1).network,
      cacheProvider: true,
      providerOptions: getProviderOptions(),
    })

    if (web3Modal.current.cachedProvider) {
      connectWallet()
    }
  })

  const sideBarContent = (
    <div className="sidebar-content">
      <div className="sidebar-title">More</div>
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
        <HeaderMeta id="header-meta">
          {ckbAddress === '' ? (
            <Button className="collect-btn" onClick={connectWallet}>
              {i18n.t('header.wallet')}
            </Button>
          ) : (
            <>
              <UserMeta>
                <img src={MetaMaskpng} alt="metaMask" />
                {truncatureStr(ckbAddress)}
              </UserMeta>
              <Popover
                placement="bottomRight"
                title=""
                overlayClassName="no-arrorPoint"
                trigger="click"
                content={<WalletBox disconnect={disconnectWallet} addresses={[ckbAddress, ethAddress]} />}
              >
                <Badge count="">
                  <img src={outlined} alt="account" className="account-btn" />
                  {/* <Button className="account-btn" icon={ <AlignCenterOutlined /> }></Button> */}
                </Badge>
              </Popover>
            </>
          )}
          <Popover
            placement="bottomRight"
            title=""
            content={sideBarContent}
            trigger="click"
            overlayClassName="sidebarBox no-arrorPoint"
            getPopupContainer={() => document.getElementById('header-meta') as HTMLElement}
          >
            <Button
              style={{
                borderRadius: '10px',
                background: 'rgba(0,106,151,1)',
                color: '#fff',
                marginLeft: '5px',
              }}
            >
              <i className="ai-ellipsis" />
            </Button>
          </Popover>
        </HeaderMeta>
      </HeaderPanel>
    </HeaderBox>
  )
}

export default Header
