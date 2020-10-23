import React, { useEffect, useRef, useState } from 'react'
import PWCore, {
  Web3ModalProvider,
  // EthSigner,
} from '@lay2/pw-core'
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import { useHistory } from 'react-router-dom'
import { Button, Popover, Menu, Badge } from 'antd'
import WalletBox from './HeaderWalletBox'
import i18n from '../../utils/i18n'
import MetaMaskpng from '../../assets/img/wallet/metamask.png'
import outlined from '../../assets/img/outlined.png'
import { HeaderBox, HeaderPanel, HeaderLogoBox, MenuLiText, HeaderMeta, UserMeta } from './styled'
import { getChainData, getProviderOptions } from './chain'

const { SDCollector } = require('./sd-collector')

export default () => {
  const history = useHistory()

  const [ckbAddress, setCkbAddress] = useState('')
  const [ethAddress, setEthAddress] = useState('')

  const truncatureStr = (str: string): string => {
    return str?.length >= 5 ? `${str.slice(0, 5)}...${str.slice(-5)}` : ''
  }

  const web3Modal = useRef<Web3Modal | null>(null)

  const connectWallet = async () => {
    const provider = await web3Modal.current!.connect()
    const web3 = new Web3(provider)
    // eslint-disable-next-line no-debugger
    await new PWCore('https://aggron.ckb.dev').init(new Web3ModalProvider(web3), new SDCollector() as any)
    const [address] = await web3.eth.getAccounts()
    // eslint-disable-next-line no-console
    setEthAddress(address.toLowerCase())
    setCkbAddress(PWCore.provider.address.toCKBAddress())
  }

  const disconnectWallet = async () => {
    await PWCore.provider.close()
    await web3Modal.current!.clearCachedProvider()
    setCkbAddress('')
    setEthAddress('')
  }

  useEffect(() => {
    web3Modal.current = new Web3Modal({
      network: getChainData(1).network,
      cacheProvider: true,
      providerOptions: getProviderOptions(),
    })

    if (web3Modal.current.cachedProvider) {
      connectWallet()
    }
  }, [])

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
        </HeaderMeta>
      </HeaderPanel>
    </HeaderBox>
  )
}
