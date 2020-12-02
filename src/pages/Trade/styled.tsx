import styled from 'styled-components'

export const TradePage = styled.div`
  min-height: calc(100% - 93px);
  background-image: linear-gradient(to top, #eeeeee, #e8e8e8);
  padding-top: 220px;
  width: 100%;
  padding-bottom: 60px;
`

export const TradeMain = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 auto;
`

export const TradeContainer = styled.div`
  margin: 0 auto;
  max-width: 1440px;
  padding: 0 120px;
  position: relative;
  width: 100%;
`

export const TradeContent = styled.div`
  box-sizing: border-box;
  background-color: #ecf2f4;
`
export interface TradeFrameProps {
  width: string
  height?: string
}

export const TradeFrame = styled.div`
  width: ${(p: TradeFrameProps) => p.width};
  height: ${(p: TradeFrameProps) => p.height ?? '650px'};
  margin: 0 40px 40px 0;
  padding: 20px 24px;
  border-radius: 16px;
  box-shadow: 3px 3px 8px 0 rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
`

export const OrderBookFrame = styled(TradeFrame)`
  margin-right: 0;
  flex: 1;
`
