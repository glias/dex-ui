import styled from 'styled-components'

export const TracePairLine = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 42px;
  margin-top: 10px;
  background-color: #fff;
  border: 1px solid rgba(171, 209, 225, 1);
  border-radius: 10px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.12);
  button {
    margin: 0;
    padding: 0;
    font-size: 20px;
  }
  span {
    text-align: center;
    font-size: 16px;
    width: 40%;
  }
`

export default TracePairLine
