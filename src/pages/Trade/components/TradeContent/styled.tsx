import styled from 'styled-components'

export const TradeTableBox = styled.div`
	overflow: hidden;
	background: #fff;
	box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.12);
	.tableHederBox {
		display: flex;	
		justify-content: space-between;
		align-items: center;
		background: rgba(81, 119, 136, 1);
		color: #fff;
		height: 50px;
		.tableHeaderSearch {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			h3 {
				color: #fff;
				font-size: 16px;
				margin: 0 10px 0;
				padding: 0;
			}
		}
		
		button {
			color: #fff;
			font-size: 14px;
		}
	}
`

export const FilterTablePire = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	color: #fff;
`