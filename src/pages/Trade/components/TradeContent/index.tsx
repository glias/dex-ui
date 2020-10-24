/* eslint-disable react/jsx-curly-newline */
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Table, Button, Input } from 'antd'
import axios from 'axios'
import { TRACE_TABLELIST } from '../../../../context/actions/types'
import { TraceTableList } from '../../../../utils/const'
import { TradeTableBox, FilterTablePire } from './styled'
import { traceState } from '../../../../context/reducers/trace'
import toExplorer from '../../../../assets/img/toExplorer.png'
import { walletState } from '../../../../context/reducers/wallet'
import { titleCase } from '../../../../lib/string'

const url =
  'http://192.168.110.123:8080/order-history?public_key_hash=0x764a1d9b7b03d5fae8bf2bfd8d1e5f0bc2aee3fe&type_code_hash=0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4&type_hash_type=type&type_args=0xb74a976e3ceab91f27690b27473731d7ccdff45302bb082394a03cb97641edaa'
const RECEIVE_UNIT = 10 * 1000 * 1000 * 1000
const PRICE_UNIT = 100 * 1000 * 1000

export default () => {
  const dispatch = useDispatch()
  const ordersList = useSelector(({ trace }: { trace: traceState }) => trace.ordersList)
  const { walletConnectStatus } = useSelector(({ wallet }: { wallet: walletState }) => wallet)

  useEffect(() => {
    if (walletConnectStatus === 'success') {
      axios.get(url).then(res => {
        dispatch({
          type: TRACE_TABLELIST,
          payload: {
            ordersList: res.data.map((item: any) => {
              return {
                status: item.status,
                executed: item.turnover_rate * 100,
                key: Math.random(),
                price: `${item.price / PRICE_UNIT} USDT per DAI`,
                receive: `${item.traded_amount / RECEIVE_UNIT} ${item.is_bid ? 'CKB' : 'SUDT'}`,
                // eslint-disable-next-line no-nested-ternary
                action: item.claimable ? 'claimed' : item.status === 'open' ? 'cancel' : 'location',
              }
            }),
          },
        })
      })
    }
  }, [walletConnectStatus, dispatch])

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
      title: 'Statue',
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
              >
                {column.action}
              </Button>
            )
          case 'location':
            return (
              <img
                src={toExplorer}
                alt="toExplorer"
                style={{
                  width: '15px',
                }}
              />
            )
          default:
            return column.action
        }
      },
    },
  ]

  const onChangePagation = ({ currentPage, status }: { currentPage: number; status: string }) => {
    axios.get(`/xxx?page=${currentPage}&status=${status}`).then(res => {
      dispatch({
        type: TRACE_TABLELIST,
        payload: {
          ordersList:
            res.data?.map((item: any) => {
              return {
                status: item.status,
                executed: item.turnover_rate,
                key: Math.random(),
                // eslint-disable-next-line no-nested-ternary
                action: item.claimable ? 'Claim' : item.status === 'open' ? 'Cancel' : 'location',
              }
            }) || [],
        },
      })
    })
  }

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
            <Button
              type="text"
              key={val}
              size="small"
              onClick={() =>
                onChangePagation({
                  status: val,
                  currentPage: 1,
                })
              }
            >
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
          onChange: onChangePagation,
        }}
        rowKey={(record: any) => record.key}
      />
    </TradeTableBox>
  )
}
