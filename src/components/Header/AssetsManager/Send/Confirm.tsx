import PWCore, { Amount, AmountUnit } from '@lay2/pw-core'
import { Divider } from 'antd'
import Token from 'components/Token'
import { isCkbWallet, WalletContainer } from 'containers/wallet'
import { parse } from 'query-string'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { AssetManagerHeader } from '../AssetManagerHeader'
import { Balance } from '../Balance'
import { Button } from '../components/Button'
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

  .amount {
    font-size: 24px;
  }
`

interface ConfirmParamsPayload {
  amount: string
  fee: string
  to: string
}

export const SendConfirm = () => {
  const { tokenName } = useParams<{ tokenName: string }>()
  const { search } = useLocation()
  const payload: ConfirmParamsPayload = (parse(search) as unknown) as ConfirmParamsPayload
  const { t } = useTranslation()
  const { pw } = WalletContainer.useContainer()
  const { useWallet, useSudt, sendCkb, sendSudt } = AssetManagerContainer.useContainer()
  const wallet = useWallet()
  const { replace } = useHistory()
  const sudt = useSudt()

  const { amount, fee, to } = payload
  const from = PWCore.provider.address.toCKBAddress()

  async function onConfirm() {
    if (!wallet || !pw) return
    if (isCkbWallet(wallet)) {
      const txHash = await sendCkb(to, new Amount(amount).toString(AmountUnit.shannon))
      replace(`/assets/${tokenName}/transactions/${txHash}`)
      return
    }

    const txHash = await sendSudt(to, new Amount(amount).toString(AmountUnit.shannon), sudt)
    replace(`/assets/${tokenName}/transactions/${txHash}`)
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
        <div className="item amount">
          <Balance value={amount} type={tokenName} />
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
          <Balance value={fee} type="CKB" />
        </div>

        <Button block size="large" onClick={onConfirm}>
          {t('Confirm')}
        </Button>
      </ConfirmWrapper>
    </>
  )
}
