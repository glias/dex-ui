import { DownloadOutlined, SendOutlined } from '@ant-design/icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'
import { WalletConnectionStatusHeader } from '../AssetManagerHeader'
import { Button } from '../components/Button'
import { BalanceStatus } from './BalanceStatus'
import { TokenTabs } from './TokenTabs'

const OperationsWrapper = styled.div`
  text-align: center;
  margin-bottom: 32px;
`

const Operations = () => {
  const { t } = useTranslation()
  const { push } = useHistory()
  const { url } = useRouteMatch()

  return (
    <OperationsWrapper>
      <Button
        icon={<SendOutlined translate="send" />}
        style={{ marginRight: '16px', height: '40px' }}
        onClick={() => push(`${url}/send`)}
      >
        {t('Send')}
      </Button>
      <Button
        icon={<DownloadOutlined translate="receive" />}
        style={{ height: '40px' }}
        onClick={() => push(`${url}/receive`)}
      >
        <span>{t('Receive')}</span>
      </Button>
    </OperationsWrapper>
  )
}

export const AssetBalance: React.FC = () => {
  return (
    <>
      <WalletConnectionStatusHeader />
      <BalanceStatus />
      <Operations />
      <TokenTabs />
    </>
  )
}
