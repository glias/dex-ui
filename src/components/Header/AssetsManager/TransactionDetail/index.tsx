import { QuestionCircleFilled } from '@ant-design/icons'
import PWCore from '@lay2/pw-core'
import { Divider, Result, Spin } from 'antd'
import { getCkbTransactionDetail, getSudtTransactionDetail, TransactionDetailModel } from 'APIs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { TransactionStatus, TransferDirection } from '../api'
import { AssetManagerHeader } from '../AssetManagerHeader'
import { Asset } from '../components/Asset'
import { TransactionStatusIcon } from '../components/TransactionStatus'
import { asserts } from '../helper'
import { AssetManagerContainer } from '../hooks'

const TransactionDetailWrapper = styled.div`
  padding: 16px;

  table {
    width: 100%;
  }

  th {
    color: #666666;
    white-space: nowrap;
    padding: 8px;
    width: 100px;
  }
`

interface ResultMainProps {
  status: TransactionStatus
  direction: TransferDirection
}

const UnknownResultMain: React.FC = () => {
  const { t } = useTranslation()
  const unknown = t('Unknown')
  return <Result icon={<QuestionCircleFilled translate={unknown} />} title={unknown} />
}

const ResultMain: React.FC<ResultMainProps> = (props: ResultMainProps) => {
  const { status, direction } = props
  const { t } = useTranslation()

  const unknownStatus = ['pending', 'success', 'failed'].includes(status) ? status : 'unknown'

  return (
    <Result icon={<TransactionStatusIcon status={status} direction={direction} />} title={status}>
      {t(unknownStatus)}
    </Result>
  )
}

const TransactionDescription = (props: { transaction: TransactionDetailModel }) => {
  const { t } = useTranslation()
  const { transaction: tx } = props
  const { amount, from, to, blockNumber, token, transactionFee, txHash } = tx

  return (
    <table>
      <tr>
        <th>{t('Token')}</th>
        <td>
          <Asset type={token} />
        </td>
      </tr>

      <tr>
        <th>{t('Amount')}</th>
        {amount}
      </tr>

      <tr>
        <th>{t('Transaction fee')}</th>
        <td>{transactionFee}</td>
      </tr>

      <tr>
        <th>{t('To')}</th>
        <td>{to}</td>
      </tr>

      <tr>
        <th>{t('From')}</th>
        <td>{from}</td>
      </tr>

      <tr>
        <th>{t('Hash')}</th>
        <td>{txHash}</td>
      </tr>

      <tr>
        <th>{t('Block No.')}</th>
        <td>{blockNumber}</td>
      </tr>
    </table>
  )
}

export const TransactionDetail: React.FC = () => {
  const { tokenName, txHash } = useParams<{ tokenName: string; txHash: string }>()
  const { useSudt } = AssetManagerContainer.useContainer()
  const sudt = useSudt()

  const { data: tx, isLoading } = useQuery<TransactionDetailModel>(['transactions', tokenName, txHash], () => {
    const lock = PWCore.provider.address.toLockScript()
    if (tokenName === 'CKB') return getCkbTransactionDetail({ lock, txHash }).then(res => res.data)
    asserts(sudt)
    return getSudtTransactionDetail({ lock, type: sudt.toTypeScript(), txHash }).then(res => res.data)
  })
  const { t } = useTranslation()

  let descriptions: React.ReactNode
  if (isLoading) {
    descriptions = <Spin />
  } else if (tx) {
    descriptions = (
      <>
        <ResultMain status={tx.status as TransactionStatus} direction={tx.direction as TransferDirection} />
        <Divider />
        <TransactionDescription transaction={tx} />
      </>
    )
  } else {
    descriptions = <UnknownResultMain />
  }

  return (
    <>
      <AssetManagerHeader showGoBack title={t('Transaction Detail')} />
      <TransactionDetailWrapper>{descriptions}</TransactionDetailWrapper>
    </>
  )
}
