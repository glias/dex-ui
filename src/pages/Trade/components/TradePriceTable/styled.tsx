import styled from 'styled-components'

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const Header = styled.header`
  font-weight: bold;
  font-size: 18px;
  line-height: 22px;
  color: #000000;
`

export const Table = styled.section`
  display: flex;
  flex-direction: column;
  padding-left: 8px;
`

const ASK_BG_COLOR = '#fae2d0'
const BID_BG_COLOR = '#d8ebd9'

export const AskTable = styled(Table)`
  margin-top: 16px;
  background-color: ${ASK_BG_COLOR};
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`

export const BidTable = styled(Table)`
  background-color: ${BID_BG_COLOR};
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
`

export const Tr = styled.li`
  display: flex;
  width: 100%;
  padding-left: 10px;
  padding-right: 18px;
  align-items: center;
  cursor: ${(props: { cursor?: 'pointer' | 'auto' }) => props.cursor ?? 'auto'};
`

export interface ProgressProps {
  isBid: boolean
  width?: string
}

export const Progress = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;

  position: relative;
  left: ${(props: ProgressProps) => `calc(100% - ${props.width})`};
  background: ${({ isBid, width }: ProgressProps) =>
    `-webkit-linear-gradient(right, ${isBid ? BID_BG_COLOR : ASK_BG_COLOR} ${width}, transparent ${width})`};
  background: ${({ isBid, width }: ProgressProps) =>
    `-webkit-linear-gradient(right, ${isBid ? BID_BG_COLOR : ASK_BG_COLOR} ${width}, transparent ${width})`};
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  transform: rotate(180deg);

  & > div {
    position: relative;
    left: ${(props: ProgressProps) => `calc(100% - ${props.width})`};

    &:first-child {
      left: ${(props: ProgressProps) => `calc(100% - ${props.width || '100%'} + 18px)`};
    }

    li {
      padding-right: 0;
    }
  }
  span {
    transform: rotate(180deg);
  }
`

export const BestPrice = styled.div`
  background: #c4c4c4;
  height: 44px;
  font-weight: bold;
  line-height: 24px;
  color: #000000;
  cursor: ${(props: { cursor?: 'pointer' | 'auto' }) => props.cursor ?? 'auto'};
  .price {
    background: #e0e0e0;
    cursor: ${(props: { cursor?: 'pointer' | 'auto' }) => (props.cursor === 'pointer' ? '20px' : '14px')};
    height: 100%;
    width: calc(100% - 8px);
    padding-left: 10px;
    margin-left: 8px;
    display: flex;
    align-items: center;
  }
`

export const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  li {
    height: 32px;
    background-color: ${(props: { isBid: boolean }) => (!props.isBid ? '#fefefe' : '#f6f6f6')};
    padding-right: 0px;
    &:nth-child(even) {
      background-color: ${(props: { isBid: boolean }) => (props.isBid ? '#fefefe' : '#f6f6f6')};
    }
  }
  overflow: hidden;
`

export const THead = styled(Tr)`
  font-weight: bold;
  font-size: 12px;
  line-height: 14px;
  color: #000000;
  height: 40px;
`

export interface TdProps {
  position: 'left' | 'center' | 'flex-end'
  fontWeight?: 'bold' | 'normal'
}

export const Td = styled.div`
  flex: 1;
  display: flex;
  justify-content: ${(props: TdProps) => props.position};
  align-items: center;
  font-weight: ${(props: TdProps) => props.fontWeight ?? 'bold'};

  span {
    &.ask {
      color: #d72903;
    }

    &.bid {
      color: #048a21;
    }
  }
`

export const List = styled(Tr)`
  font-size: 12px;
  line-height: 14px;
  .price {
    font-weight: bold;
  }
  .receive,
  .pay {
    font-weight: normal;
    color: #606060;
  }
`
