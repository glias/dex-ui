import styled from 'styled-components'

export const InputContainer = styled.div`
  .ant-form-item {
    label {
      font-size: 14px;
      line-height: 17px;
    }
    input[type='number'] {
      appearance: textfield;
      padding-left: 17px;
      background: #f6f6f6;
      border: 1px solid #e1e1e1;
      border-radius: 16px;
    }
    input[type='number']::-webkit-inner-spin-button {
      appearance: none;
    }
    input[type='number']::-webkit-outer-spin-button {
      margin: 0;
    }
  }
`
