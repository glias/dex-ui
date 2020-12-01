import { Col, List, Row, Spin, Tooltip, Typography } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'
import { SUDT_LIST } from '../../../../constants/sudt'
import { getCkbTransferSummaries, getSudtTransferSummaries, TransactionDirection, TransactionSummary } from '../api'
import { Balance } from '../Balance'
import { RadioItem, RadioTabs } from '../components/RadioTabs'
import { TransactionStatusIcon } from '../components/TransactionStatus'

const { Text, Title } = Typography

interface TransactionListItemProps {
  transaction: TransactionSummary
}

const TransactionListItemWrapper = styled.div`
  font-size: 12px;
  padding: 16px;
  cursor: pointer;

  :nth-child(odd) {
    background: #f6f6f6;
  }

  .ant-row {
    flex-wrap: nowrap;
  }

  .ant-col {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .amount {
    font-weight: bold;
  }
  .symbol {
    padding-right: 8px;
  }
`

const TransactionListItem: React.FC<TransactionListItemProps> = (props: TransactionListItemProps) => {
  const { transaction: tx } = props
  const { push } = useHistory()
  const match = useRouteMatch()
  return (
    <TransactionListItemWrapper onClick={() => push(`${match.url}/transactions/${tx.txHash}`)}>
      <Row gutter={8} align="middle">
        <Col flex="40px">
          <TransactionStatusIcon status={tx.status} direction={tx.direction} filled width={18} />
        </Col>
        <Col flex="auto">
          <Row gutter={8}>
            <Col flex="auto">
              <Tooltip title={tx.txHash}>{tx.txHash}</Tooltip>
            </Col>
            <Col flex="none">
              <Text type="secondary">{tx.date}</Text>
            </Col>
          </Row>
          <Row justify="end" className="amount" style={{ paddingTop: '4px' }}>
            <span className="symbol">{tx.direction === 'in' ? '+' : '-'}</span>
            <Balance value={tx.amount} type={tx.tokenName} decimal={8} />
          </Row>
        </Col>
      </Row>
    </TransactionListItemWrapper>
  )
}

const TransactionListWrapper = styled.div`
  .ant-list {
    max-height: 250px;
    overflow: auto;
  }
`

interface TransactionListProps {
  tokenName?: string
}
export const TransactionList: React.FC<TransactionListProps> = (/* props: TransactionListProps */) => {
  const { t } = useTranslation()
  const [transferDirection, setTransferDirectionFilter] = useState<'all' | TransactionDirection>('all')
  const { tokenName } = useParams<{ tokenName: string }>()

  const { data: txs, isLoading } = useQuery<TransactionSummary[]>(
    ['transactions', tokenName, transferDirection],
    () => {
      const direction = transferDirection === 'all' ? undefined : transferDirection
      if (tokenName === 'CKB') return getCkbTransferSummaries({ direction })

      const sudt = SUDT_LIST.find(sudt => sudt.info?.name === tokenName)
      if (!sudt) return []
      return getSudtTransferSummaries({ sudt, direction })
    },
  )

  function onDirectionChange(direction: string) {
    setTransferDirectionFilter(direction as 'all' | TransactionDirection)
  }

  if (isLoading) return <Spin size="large" tip="loading..." />
  const transferList =
    txs && txs.length ? (
      txs.map((tx: TransactionSummary) => <TransactionListItem key={tx.txHash} transaction={tx} />)
    ) : (
      <Title style={{ textAlign: 'center', padding: '16px' }} level={3} type="secondary">
        {t('No related transactions')}
      </Title>
    )

  return (
    <TransactionListWrapper>
      <RadioTabs mode="underline" value={transferDirection} onChange={onDirectionChange}>
        <RadioItem key="all">{t('All')}</RadioItem>
        <RadioItem key="in">{t('In')}</RadioItem>
        <RadioItem key="out">{t('Out')}</RadioItem>
      </RadioTabs>

      <List>{transferList}</List>
    </TransactionListWrapper>
  )
}
