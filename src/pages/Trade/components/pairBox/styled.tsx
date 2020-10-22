import styled from 'styled-components'

export const PairList = styled.div`
  color: rgba(102, 102, 102, 1);
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  img {
    width: 20px;
    height: 20px;
    margin-right: 5px;
  }
`

export const PairBox = styled.div`
  font-size: 16px;
  .pairTraceList {
    display: flex;
    padding: 0 10px;
    height: 42px;
    line-height: 42px;
    cursor: pointer;
    &: hover {
      background: #f2f4f5;
    }
    .decollect {
      padding: 0 10px;
      color: rgba(136, 136, 136, 1);
    }
  }
`
