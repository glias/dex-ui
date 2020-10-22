import React, { useState } from 'react'
import { Table, Button, Input } from 'antd'
import { TraceTaTbleFilterList } from '../../../../utils/const'
import {
	TradeTableBox,
	FilterTablePire
} from './styled'
 
export default () => {
	const [orders, setOrders] = useState([])
	const columns = [
		{
			title: 'Pay',
			dataIndex: 'Pay',
			key: 'Pay'
		},
		{
			title: 'Receive',
			dataIndex: 'Receive',
			key: 'Receive'
		},
		{
			title: 'Price',
			dataIndex: 'Price',
			key: 'Price'
		},
		{
			title: 'Status',
			dataIndex: 'Status',
			key: 'Status'
		},
		{
			title: 'Executed',
			dataIndex: 'Executed',
			key: 'Executed'
		},
		{
			title: 'Action',
			dataIndex: 'Action',
			key: 'Action'
		}
	]

	// fetch tableData

	return (
		<TradeTableBox>
			<div className="tableHederBox">
				<div className="tableHeaderSearch">
					<h3>My Orders</h3>
					<Input placeholder="Filter Token" style={{width: '180px'}} prefix={<i className="ai-search" />} />
				</div>
				<FilterTablePire>
					{
						TraceTaTbleFilterList.map(val => (
								<Button type="text" key={val} size="small">{val}</Button>
							)
						)
					}
				</FilterTablePire>
			</div>
			<Table dataSource={orders} columns={columns}></Table>
		</TradeTableBox>
	)
}