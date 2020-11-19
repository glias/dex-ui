import styled from 'styled-components'

export const TradePage = styled.div`
  min-height: calc(100% - 93px);
  padding: 0 120px;
  padding-top: 220px;
  background-image: linear-gradient(to top, #eeeeee, #e8e8e8);
`

export const TradeMain = styled.div`
  margin: 0 auto;
`

export const TradeContent = styled.div`
  box-sizing: border-box;
  background-color: #ecf2f4;
`

export const TradeFrame = styled.div`
  width: ${(p: { width: string }) => p.width};
  margin: 0 40px 40px 0;
  padding: 24px 20px;
  border-radius: 16px;
  box-shadow: 3px 3px 8px 0 rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
`
