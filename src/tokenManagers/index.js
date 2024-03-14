import React, { Component } from 'react';
import './index.css';
import Fields from '../fields'
import chainState from '../utils/chain-state'

class TokenManager extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  getInfo = async () => {
    const data = await chainState.getTokenManagers();
    if (data) {
      // 过滤一下空的项
      // {
      //   "tms":[
      //     {
      //       "title":"TokenPairID: 1",
      //       "columns":["name","WAN","ETH","BSC","AVAX","DEV","MATIC","ARB","FTM","OPT","XDC","TRON","OKT","CLV","FX","ASTR","TLOS","GTH","OKB","METIS","ZKETH","MATICETH","ZEN","VC","BASEETH","NRG"],
      //       "data":[
      //         {"name":"id","WAN":1,"ETH":1,"BSC":"empty","AVAX":"empty","DEV":"empty","MATIC":"empty","ARB":"empty","FTM":"empty","OPT":"empty","XDC":"empty","TRON":"empty","OKT":"empty","CLV":"empty","FX":"empty","ASTR":"empty","TLOS":"empty","GTH":"empty","OKB":"empty","METIS":"empty","ZKETH":"empty","MATICETH":"empty","ZEN":"empty","VC":"empty","BASEETH":"empty","NRG":"empty"},
      //         {"name":"ancestor-account","WAN":"0x0000000000000000000000000000000000000000","ETH":"0x0000000000000000000000000000000000000000","BSC":"empty","AVAX":"empty","DEV":"empty","MATIC":"empty","ARB":"empty","FTM":"empty","OPT":"empty","XDC":"empty","TRON":"empty","OKT":"empty","CLV":"empty","FX":"empty","ASTR":"empty","TLOS":"empty","GTH":"empty","OKB":"empty","METIS":"empty","ZKETH":"empty","MATICETH":"empty","ZEN":"empty","VC":"empty","BASEETH":"empty","NRG":"empty"}
      //       ]
      //     }
      //   ]
      // }
      if (data && data.tms) {
        for (let i = 0; i < data.tms.length; i++) {
          const table =  data.tms[i]
          const ids = table.data.find(i => i.name === 'id')
          const emptyChains = []
          for (let j = 1; j < table.columns.length; j++) {
            const chainType = table.columns[j]
            if (ids[chainType] === 'empty') {
              emptyChains.push(chainType)
            }
          }
    
          table.columns = table.columns.filter(chainType => !emptyChains.includes(chainType))
    
          for (let j = 0; j < table.data.length; j++) {
            for (let chainType in table.data[j]) {
              if (table.data[j].hasOwnProperty(chainType) && emptyChains.includes(chainType)) {
                delete table.data[j][chainType];
              }
            }
          }
        }
      }
      this.setState(data);
    }
  }

  componentDidMount() {
    console.log("Oracle ComponentDidMount")
    this.getInfo()
    // this.timer = setInterval(this.getInfo, 600000, null)
  }

  componentWillUnmount() {
    console.log("Oracle ComponentWillUnmount")
    // clearInterval(this.timer)
  }
  // TODO: update remove tokenPair
  render() {
    let tms = <div>Loading...</div>
    if (this.state.tms && this.state.tms.length > 0) {
      tms = this.state.tms.map(tm => {
        return <Fields title={tm.title} columns={tm.columns} data={tm.data} />
      })
    }
    return (
      <div className="tms">
        { tms }
      </div>
    )
  }
}

export default TokenManager