import styled from 'styled-components'

export const Container = styled.div`
  .current {
    margin-top: 30px;
  }
  .ant-input-affix-wrapper {
    border: 1px solid #e1e1e1;
    box-sizing: border-box;
    border-radius: 10px;
    background: #f6f6f6;
    margin: 14px 0;
    color: #888888;
    input {
      background: #f6f6f6;
    }
  }
`

export const Main = styled.main`
  overflow: auto;
  flex: 1;
  max-height: 400px;
`

export const TokenContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 14px;
  cursor: pointer;
  .left {
    align-items: flex-start;
  }
  .right {
    margin-left: auto;
    font-weight: bold;
    font-size: 16px;
    line-height: 17px;
    color: #666666;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`
