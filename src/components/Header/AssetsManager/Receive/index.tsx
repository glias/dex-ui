import { Typography } from 'antd'
import WalletContainer from 'containers/wallet'
import QRCode from 'qrcode.react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { AssetManagerHeader } from '../AssetManagerHeader'
import { RadioItem, RadioTabs } from '../components/RadioTabs'

const { Text } = Typography

const ReceiveWrapper = styled.div`
  text-align: center;
  padding: 16px;

  .title {
    color: #888;
    padding: 8px;
  }

  .qr-code {
    padding: 24px;
  }
`

export const Receive: React.FC = () => {
  const [receiveWalletType, setReceiveWalletType] = useState('ckb')
  const { t } = useTranslation()
  const { tokenName } = useParams<{ tokenName: string }>()
  const { wallets } = WalletContainer.useContainer()
  const wallet = wallets.find(wallet => wallet.tokenName === tokenName)

  if (!wallet) return null

  const qrCodeContent = wallet.address && (
    <>
      <QRCode style={{ width: '200px', height: '200px' }} className="qr-code" value={wallet.address} />
      <Text strong>{wallet.address}</Text>
    </>
  )

  function changeWallet(inputType: string) {
    setReceiveWalletType(inputType)
  }

  return (
    <>
      <AssetManagerHeader showGoBack title={t('Receive')} />
      <ReceiveWrapper>
        <div className="title">{t('Receive from')}</div>
        <RadioTabs value={receiveWalletType} onChange={changeWallet}>
          <RadioItem key="portal">{t('Portal Wallet')}</RadioItem>
          <RadioItem key="ckb">{t('Wallets or Exchanges')}</RadioItem>
        </RadioTabs>
        {qrCodeContent}
      </ReceiveWrapper>
    </>
  )
}
