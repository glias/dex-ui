import React from 'react'
import styled from 'styled-components'

const NotFoundPanel = styled.div`
  margin-top: 120px;
  margin-bottom: 140px;
`

const NotFoundImage = styled.img`
  width: 1038px;
  height: 480px;
  margin: 0 auto;
  display: block;

  @media (max-width: 750px) {
    width: 282px;
    height: 130px;
  }
`

export default () => {
  return (
    <NotFoundPanel className="404">
      <NotFoundImage src='' alt="404" />
    </NotFoundPanel>
  )
}
