/* eslint-disable react/jsx-curly-newline */
import React, { useCallback } from 'react'
import { useContainer } from 'unstated-next'
import { Table, Button, Input } from 'antd'
import axios from 'axios'
import { Address, Amount, OutPoint, AddressType } from '@lay2/pw-core'
import { TraceTableList } from '../../../../utils/const'
import { TradeTableBox, FilterTablePire } from './styled'
import toExplorer from '../../../../assets/img/toExplorer.png'
import { titleCase } from '../../../../lib/string'
import { useDidMount } from '../../../../hooks'
import OrderContainer from '../../../../containers/order'
import CancelOrderBuilder from '../../../../pw/cancelOrderBuilder'
import WalletContainer from '../../../../containers/wallet'

const url =
  'http://192.168.110.123:8080/order-history?public_key_hash=0x6c8c7f80161485c3e4adceda4c6c425410140054&type_code_hash=0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4&type_hash_type=type&type_args=0x6fe3733cd9df22d05b8a70f7b505d0fb67fb58fb88693217135ff5079713e902'
const RECEIVE_UNIT = 10 * 1000 * 1000 * 1000
const PRICE_UNIT = 100 * 1000 * 1000

export default () => {
  const Order = useContainer(OrderContainer)
  const Wallet = useContainer(WalletContainer)

  const ordersList: any[] = Order.historyOrders

  useDidMount(() => {
    axios.get(url).then(res => {
      Order.concatHistoryOrders(
        res.data.map((item: any) => {
          const txHash = item.last_order_cell_outpoint.tx_hash
          return {
            ...item,
            status: item.status,
            executed: item.turnover_rate * 100,
            key: txHash,
            txHash,
            price: `${item.price / PRICE_UNIT} USDT per DAI`,
            receive: `${item.traded_amount / RECEIVE_UNIT} ${item.is_bid ? 'CKB' : 'SUDT'}`,
            // eslint-disable-next-line no-nested-ternary
            action: item.claimable ? 'claimed' : item.status === 'open' ? 'cancel' : 'location',
          }
        }),
      )
    })
  })

  const onCancel = useCallback(
    async (txHash: string) => {
      // eslint-disable-next-line no-debugger
      // debugger
      const order = ordersList.find((o: any) => o.last_order_cell_outpoint.tx_hash === txHash)
      const outpoint = order.last_order_cell_outpoint

      const builder = new CancelOrderBuilder(
        new Address(Wallet.ckbWallet.address, AddressType.ckb),
        new OutPoint(outpoint.tx_hash, outpoint.index),
        new Amount('400'),
      )

      const hash = await Wallet.pw?.sendTransaction(await builder.build())
      console.log(hash)
    },
    [ordersList, Wallet.pw, Wallet.ckbWallet.address],
  )

  const columns = [
    {
      title: 'Pay',
      dataIndex: 'pay',
      key: 'pay',
    },
    {
      title: 'Receive',
      dataIndex: 'receive',
      key: 'receive',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => (
        <span
          style={{
            color: ['completed', 'claimed'].includes(value) ? 'rgba(136, 136, 136, 1)' : 'rgba(0, 0, 0, 1)',
          }}
        >
          {titleCase(value)}
        </span>
      ),
    },
    {
      title: 'Executed',
      dataIndex: 'executed',
      key: 'executed',
      render: (value: any) => (value ? `${value} %` : '--'),
    },
    {
      title: 'Action',
      dataIndex: '',
      key: 'action',
      render: (column: any) => {
        switch (column.action) {
          case 'claimed':
            return (
              <Button
                shape="round"
                style={{
                  color: 'rgba(102, 102, 102, 1)',
                }}
              >
                {column.action}
              </Button>
            )
          case 'cancel':
            return (
              <Button
                shape="round"
                style={{
                  color: 'rgba(102, 102, 102, 1)',
                }}
                onClick={() => {
                  // eslint-disable-next-line no-debugger
                  onCancel(column.key)
                }}
              >
                {column.action}
              </Button>
            )
          case 'location':
            return (
              <a
                target="_blank"
                rel="noreferrer noopener"
                href={`https://explorer.nervos.org/aggron/transaction/${column.key}`}
              >
                <img
                  src={toExplorer}
                  alt="toExplorer"
                  style={{
                    width: '15px',
                  }}
                />
              </a>
            )
          default:
            return column.action
        }
      },
    },
  ]

  return (
    <TradeTableBox>
      <div className="tableHederBox">
        <div className="tableHeaderSearch">
          <h3>My Orders</h3>
          <Input
            placeholder="Filter Token"
            style={{
              width: '180px',
              color: 'rgba(136, 136, 136, 1)',
            }}
            prefix={<i className="ai-search" />}
          />
        </div>
        <FilterTablePire>
          {TraceTableList.map(val => (
            <Button type="text" key={val} size="small">
              {val}
            </Button>
          ))}
        </FilterTablePire>
      </div>
      <Table
        dataSource={ordersList}
        columns={columns}
        size="small"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
        rowKey={(record: any) => record.key}
      />
    </TradeTableBox>
  )
}
