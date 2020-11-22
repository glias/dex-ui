import styled from 'styled-components'

export const BID_CONFIRM_COLOR = '#ff9a6f'
export const ASK_CONFRIM_COLOR = '#72d1a4'

export const BID_RECEIVE_COLOR = '#FCF0E6'
export const BID_RECEIVE_BORDER = '#FAE2D0'

export const ASK_RECEIVE_COLOR = '#E9F6F1'
export const ASK_RECEIVE_BORDER = '#D8EBD9'

export interface ContainerProps {
  isBid: boolean
}

export const PairContainer = styled.div`
  display: flex;
  flex-direction: row;
  cursor: pointer;
  .left {
    align-items: flex-start;
  }
  .right {
    align-items: flex-end;
    margin-left: auto;
    color: #7e7e7e;
  }
`

export const PairsContainer = styled.section`
  display: flex;
  flex-direction: row;
  margin: 24px 0;
  .pairs {
    flex: 1;
  }
`

export const Swap = styled.div`
  margin-left: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  svg {
    position: relative;
    cursor: pointer;
    left: 8px;
  }
`

export const InputNumberContainer = styled.div`
  .ant-form {
    background: #fff;
    display: flex;
    flex-direction: column;
    height: 100%;
    .ant-form-item {
      label {
        font-size: 16px;
      }
      input[type='number'] {
        appearance: textfield;
        padding-left: 14px;
        font-size: 24px;
        line-height: 29px;
        color: #000000;
        height: 34px;
      }
      .receive {
        border: solid 1px ${(props: ContainerProps) => (props.isBid ? BID_RECEIVE_BORDER : ASK_RECEIVE_BORDER)};
        background-color: ${(props: ContainerProps) => (props.isBid ? BID_RECEIVE_COLOR : ASK_RECEIVE_COLOR)};
        cursor: default;
        input {
          cursor: text;
        }
      }
      .ant-input-affix-wrapper-lg {
        padding: 10px;
      }
      input[type='number']::-webkit-inner-spin-button {
        appearance: none;
      }
      input[type='number']::-webkit-outer-spin-button {
        margin: 0;
      }
      &.submit {
        margin-top: auto;
        margin-bottom: 0;
      }
    }
    .ant-input-suffix {
      font-size: 12px;
      line-height: 14px;
      color: #888888;
      align-items: flex-end;
    }
    .ant-divider-horizontal {
      margin: 10px 0;
      border-top-color: #e1e1e1;
    }
  }
  .ant-input-affix-wrapper,
  input {
    background: #f6f6f6;
    border: 1px solid #e1e1e1;
    border-radius: 16px;
  }
`

export const OrderTableContainer = styled(InputNumberContainer)`
  height: 100%;
`

export const OrderSelectPopover = styled.div`
  width: 100%;
  padding: 10px 10px 30px;
`

export const PayMeta = styled.div`
  position: absolute;
  top: -30px;
  right: 0;
  font-size: 13px;
  color: rgba(102, 102, 102, 1);
  .form-label-meta-num {
    margin: -30px 5px 0 0;
    color: rgba(102, 102, 102, 1);
    padding: 0;
    text-decoration: underline;
    span {
      text-decoration: underline;
    }
  }

  button {
    border: none;
    background-color: white;
    color: #5c61da;
    font-size: 12px;
    line-height: 14px;
    text-decoration: underline;
    margin-right: 4px;
    cursor: pointer;
    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
`

export const PairBlock = styled.div`
  font-size: 16px;
  display: flex;
  padding-left: 20px;
  .pair-trace-box {
    display: flex;
    padding: 0 10px;
    height: 40px;
    width: 100%;
    line-height: 40px;
    cursor: pointer;
    &:hover {
      background: #f2f4f5;
    }
    .decollete {
      padding: 0 10px;
      color: rgba(136, 136, 136, 1);
    }
  }
`

export const Header = styled.div`
  h3 {
    font-size: 18px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: left;
    color: #000000;
    margin: 0;
  }
`
