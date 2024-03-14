import React, { Component } from 'react'
import './index.css'
import Fields from '../fields'
import chainState from '../utils/chain-state'

class Oracle extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  getInfo = async () => {
    const data = await chainState.getOracles();
    if (data) {
      if (data.sgs) {
        const recentSgs = []
        // 100 day
        const curTime = Math.floor(new Date().getTime() / 1000);
        const during = 8640000
        for (let i = 0; i < data.sgs.length; i++) {
          const table =  data.sgs[i]
          // {"name":"endTime","VC":"0","WAN":"1602838195","TRON":"0","ARB":"0","AVAX":"1602838195","NRG":"0","ZKETH":"0","TLOS":"0","XDC":"0","ETH":"0","BASEETH":"0","MATIC":"0","FTM":"0","METIS":"0","FX":"0","BSC":"1602838195","OKB":"0","OPT":"0","OKT":"0","MATICETH":"0","DEV":"0","GTH":"0","ZEN":"0","ASTR":"0","CLV":"0"}
          const endTimes = table.data.find(i => i.name === 'endTime')
          const emptyChains = []
          for (let j = 1; j < table.columns.length; j++) {
            const chainType = table.columns[j]
            if (chainType === "WAN") {
              const endTime = parseInt(endTimes)
              if (endTime > curTime - during) {
                recentSgs.push(table)
              }
            }
            if (endTimes[chainType] === '0') {
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
        data.sgs = recentSgs
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

  render() {
    // const keys = Object.keys(this.state)
    // // console.log(`keys are ${JSON.stringify(keys, null, 2)}`)
    // let subs = <div>Loading...</div>
    // if (keys.length > 0) {
    //   subs = keys.map(key => {
    //     // console.log(`${key} states are ${JSON.stringify(this.state[key], null, 2)}`)
    //     if (this.state[key].columns) {
    //       return <Fields title={this.state[key].title} columns={this.state[key].columns} data={this.state[key].data} />
    //     } else {
    //       return <div>Loading...</div>
    //     }
    //   })
    // }
    let prices = <div>Loading...</div>;
    let configs = <div>Loading...</div>;
    let sgs = <div>Loading...</div>;
  
    if (this.state.prices) {
      prices = <Fields title={this.state.prices.title} columns={this.state.prices.columns} data={this.state.prices.data} />
    }
    if (this.state.configs) {
      configs = <Fields title={this.state.configs.title} columns={this.state.configs.columns} data={this.state.configs.data} />
    }
    if (this.state.sgs && this.state.sgs.length > 0) {
      sgs = this.state.sgs.map(sg => {
        return <Fields title={sg.title} columns={sg.columns} data={sg.data} />
      })
    }
    return (
      <div className='oracles'>
        { prices }
        { configs }
        { sgs }
      </div>
    )
  }
}

export default Oracle
