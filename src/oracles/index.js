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
        for (let i = 0; i < data.sgs.length; i++) {
          const table =  data.sgs[i]
          const ids = table.data.find(i => i.name === 'endTime')
          const emptyChains = []
          for (let j = 1; j < table.columns.length; j++) {
            const chainType = table.columns[j]
            if (ids[chainType] === '0') {
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
