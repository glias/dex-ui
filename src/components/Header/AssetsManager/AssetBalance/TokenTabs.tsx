import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RadioItem, RadioTabs } from '../components/RadioTabs'
import { TransactionList } from '../TransactionList'
import { AssetList } from './TokenList'

export const TokenTabs: React.FC = () => {
  const [activatedTab, setActivatedTab] = useState('assets')
  const { t } = useTranslation()

  const tabContent = activatedTab === 'assets' ? <AssetList /> : <TransactionList />

  return (
    <>
      <RadioTabs style={{ height: '40px' }} onChange={selected => setActivatedTab(selected)} value={activatedTab}>
        <RadioItem key="assets">{t('Assets')}</RadioItem>
        <RadioItem key="transactions">{t('Transactions')}</RadioItem>
      </RadioTabs>
      {tabContent}
    </>
  )
}
