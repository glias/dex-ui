import styled from 'styled-components'

export const TradePairConfirmBox = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const OrderButton = styled.div`
  border-top: 1px solid rgba(171, 209, 225, 1);
  height: 60px;
  line-height: 60px;
  text-align: center;
  button {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }
  button[disabled],
  button[disabled]:hover {
    background: rgba(241, 241, 241, 1);
    border-bottom-right-radius: 10px;
    overflow: hidden;
    border-bottom-left-radius: 10px;
  }
`

export const ConfirmHeader = styled.div`
  text-align: center;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000;
  button {
    float: left;
    color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    background: none;
    border: none;
    color: black;
    cursor: pointer;
    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
  span {
    display: inline-block;
    font-size: 18px;
    line-height: 22px;
    font-weight: bold;
  }
`

export const PairsContainer = styled.section`
  height: 88px;
  display: flex;
  justify-content: center;
  align-items: center;
  .pairs {
    display: flex;
    flex-direction: row;
    align-items: center;
    .svg {
      margin-left: 14px;
      margin-right: 14px;
      color: #888888;
    }
  }
`

export const ListContainer = styled.div`
  font-weight: bold;
  font-size: 18px;
  line-height: 22px;
  color: #000;
  .item {
    display: flex;
    flex-direction: row;
    margin-bottom: 8px;
    .left {
      align-items: flex-start;
    }
    .right {
      align-items: flex-end;
      margin-left: auto;
      .value {
        margin-right: 4px;
      }
    }
  }
  &.detail {
    font-weight: normal;
    font-size: 14px;
    line-height: 17px;
    color: #666666;
  }
`

export const TradePairConfirmContent = styled.main`
  .circle-icon {
    width: 100px;
    color: rgba(136, 136, 136, 1);
    display: block;
    text-align: center;
  }
  .ant-divider-horizontal {
    margin: 0;
    border-top-color: #e1e1e1;
  }
`

export const MetaContainer = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f6f6f6;
  font-size: 14px;
  line-height: 17px;
  color: #000;
  a {
    text-decoration: underline;
    color: #5c61da;
  }
`

export const OrderResult = styled.div`
  margin-top: 24px;
`

export const Footer = styled.div`
  margin-top: auto;
  align-items: flex-end;
`
