const PORT = process.env.REACT_APP_PORT || '13200'
const BASE = `http://34.210.149.238:${PORT}`

export const API = {
  prices: `${BASE}/pricesRaw`,
  configuration: `${BASE}/configurationRaw`,
  chains: `${BASE}/chainsRaw`,
  storemanConfig: `${BASE}/storemanConfigRaw`,
  tokenPair: `${BASE}/tmsraw`,
  tokens: `${BASE}/tokensRaw`,
}