import PWCore from '@lay2/pw-core'
import { Divider } from 'antd'
import Token from 'components/Token'
import { isCkbWallet, isSudtWallet, WalletContainer } from 'containers/wallet'
import { parse } from 'query-string'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { AssetManagerHeader } from '../AssetManagerHeader'
import { Balance } from '../Balance'
import { Button } from '../components/Button'
import { asserts } from '../helper'
import { AssetManagerContainer } from '../hooks'

const ConfirmWrapper = styled.div`
  padding: 16px;

  .label {
    color: #666;
    margin-bottom: 8px;
  }

  .item {
    margin-bottom: 8px;
    word-break: break-all;
    color: #000;
  }

  .btn-confirm {
    margin-top: 16px;
  }
`

interface ConfirmParamsPayload {
  amount: string
  fee: string
  to: string
  force: '0' | '1'
}

export const SendConfirm = () => {
  const { tokenName } = useParams<{ tokenName: string }>()
  const { search } = useLocation()
  const payload: ConfirmParamsPayload = (parse(search) as unknown) as ConfirmParamsPayload
  const { t } = useTranslation()
  const { pw } = WalletContainer.useContainer()
  const { wallet, decimal, sudt, sendHelper } = AssetManagerContainer.useContainer()
  const { replace } = useHistory()
  const [confirming, setIsConfirming] = useState(false)

  const { amount, fee, to, force } = payload
  const from = PWCore.provider.address.toCKBAddress()

  async function onConfirm() {
    if (!wallet || !pw) return
    setIsConfirming(true)
    try {
      let txHash: string | undefined
      if (isCkbWallet(wallet)) {
        txHash = await sendHelper.sendCkb(to, amount)
      } else if (isSudtWallet(wallet)) {
        asserts(sudt)
        txHash = await sendHelper.sendSudt(to, amount, sudt, force === '1')
      }

      if (txHash) replace(`/assets/${tokenName}#transactions`)
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <>
      <AssetManagerHeader showGoBack title={t('Confirm')} />
      <ConfirmWrapper>
        <div className="label">{t('Token')}</div>
        <div className="item">
          <Token tokenName={tokenName} />
        </div>

        <Divider />

        <div className="label">{t('Amount')}</div>
        <div className="item">
          <Balance size={24} value={amount} suffix={tokenName} decimal={decimal} />
        </div>

        <Divider />

        <div className="label">{t('To')}</div>
        <div className="item">{to}</div>

        <Divider />

        <div className="label">{t('From')}</div>
        <div className="item">{from}</div>

        <Divider />

        <div className="label">{t('Transaction Fee')}</div>
        <div className="item">
          <Balance value={fee} suffix="CKB" maxDecimalPlaces={8} />
        </div>

        <Button className="btn-confirm" block size="large" onClick={onConfirm} loading={confirming}>
          {t('Confirm')}
        </Button>
      </ConfirmWrapper>
    </>
  )
}
