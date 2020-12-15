import { AssetManagerControl } from 'components/Header/AssetsManager'
import React from 'react'
import styled from 'styled-components'

const MobileAssetManagerWrapper = styled.div`
  background: #fff;
`

export const AssetManager = () => {
  return (
    <MobileAssetManagerWrapper>
      <AssetManagerControl />
    </MobileAssetManagerWrapper>
  )
}
