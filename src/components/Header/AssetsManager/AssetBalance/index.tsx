import { DownloadOutlined, SendOutlined } from '@ant-design/icons'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { AssetManagerHeader, WalletConnectionStatusHeader } from '../AssetManagerHeader'
import { Button } from '../components/Button'
import { AssetManagerContainer } from '../hooks'
import { BalanceStatus } from './BalanceStatus'
import { TokenTabs } from './TokenTabs'

const OperationsWrapper = styled.div`
  text-align: center;
  margin-bottom: 32px;
`

const Operations = () => {
  const { t } = useTranslation()
  const { push } = useHistory()
  const { tokenName } = AssetManagerContainer.useContainer()

  return (
    <OperationsWrapper>
      <Button
        icon={<SendOutlined translate="send" />}
        style={{ marginRight: '16px', height: '40px' }}
        onClick={() => push(`/assets/${tokenName}/send`)}
      >
        {t('Send')}
      </Button>
      <Button
        icon={<DownloadOutlined translate="receive" />}
        style={{ height: '40px' }}
        onClick={() => push(`/assets/${tokenName}/receive`)}
      >
        <span>{t('Receive')}</span>
      </Button>
    </OperationsWrapper>
  )
}

export const AssetBalance: React.FC = () => {
  const { tokenName } = useParams<{ tokenName?: string }>()
  const { setTokenName } = AssetManagerContainer.useContainer()

  useEffect(() => {
    if (tokenName) {
      setTokenName(tokenName)
    }
  }, [tokenName, setTokenName])

  const headerElement = tokenName ? <AssetManagerHeader showGoBack /> : <WalletConnectionStatusHeader />

  return (
    <>
      {headerElement}
      <BalanceStatus />
      <Operations />
      <TokenTabs />
    </>
  )
}
