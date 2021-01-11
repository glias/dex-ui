import { LeftOutlined } from '@ant-design/icons'
import PWCore from '@lay2/pw-core'
import { Button, Col, Row, Typography } from 'antd'
import OrderContainer from 'containers/order'
import WalletContainer from 'containers/wallet'
import React, { HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { useContainer } from 'unstated-next'
import { ellipsisCenter } from 'utils/common'

const { Text } = Typography

const AssetManagerHeaderWrapper = styled.header`
  height: 40px;
  padding: 8px 16px;

  font-weight: bold;
  font-size: 18px;
  text-align: center;
`

interface AssetManagerHeaderProps extends HTMLAttributes<HTMLDivElement> {
  showGoBack?: boolean
}

export const AssetManagerHeader: React.FC<AssetManagerHeaderProps> = (props: AssetManagerHeaderProps) => {
  const { children, showGoBack, title } = props
  const { goBack } = useHistory()

  return (
    <AssetManagerHeaderWrapper>
      <Row align="middle">
        <Col flex="24px">{showGoBack && <LeftOutlined translate="" onClick={() => goBack()} />}</Col>
        {children && <Col flex="auto">{children}</Col>}
        {!children && title && <Col flex="auto">{title}</Col>}
        {showGoBack && <Col flex="24px" />}
      </Row>
    </AssetManagerHeaderWrapper>
  )
}

const WalletConnectionStatusHeaderWrapper = styled.div`
  padding: 10px 14px;
  display: flex;
  align-content: space-between;
  flex-wrap: nowrap;
  align-items: center;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.08);
  font-size: 12px;

  .wallet {
    color: #888888;
  }

  .address {
    font-weight: 400;
  }

  .info-connection {
    flex: auto;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .button {
  }
`

export const WalletConnectionStatusHeader = () => {
  const { t } = useTranslation()
  const address = PWCore.provider.address.toCKBAddress()
  const { disconnectWallet, web3ModalRef, connectWallet } = WalletContainer.useContainer()
  const { reset } = useContainer(OrderContainer)

  const web3Modal = web3ModalRef.current

  if (!web3Modal) return null

  async function close() {
    await disconnectWallet(reset)
    await connectWallet()
  }

  let connected: string = web3Modal.cachedProvider
  if (web3Modal.cachedProvider === 'injected') connected = 'MetaMask'
  if (web3Modal.cachedProvider === 'walletconnect') connected = 'WalletConnect'

  return (
    <WalletConnectionStatusHeaderWrapper>
      <div className="info-connection">
        <div className="wallet">
          {t('Connected to ')}
          <Text strong>{connected}</Text>
        </div>
        <div className="address">
          <Text copyable={{ text: address }}>{ellipsisCenter(address, 16)}</Text>
        </div>
      </div>
      <div className="button">
        <Button size="small" type="link" onClick={close}>
          {t('Change')}
        </Button>
      </div>
    </WalletConnectionStatusHeaderWrapper>
  )
}
