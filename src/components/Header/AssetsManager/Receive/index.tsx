import PWCore from '@lay2/pw-core'
import { Typography } from 'antd'
import QRCode from 'qrcode.react'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const rawAddress = PWCore.provider.address
  const address = receiveWalletType === 'ckb' ? rawAddress.toCKBAddress() : rawAddress.addressString

  const qrCodeContent = useMemo(
    () => (
      <>
        <QRCode style={{ width: '200px', height: '200px' }} className="qr-code" value={address} />
        <Text copyable strong>
          {address}
        </Text>
      </>
    ),
    [address],
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
