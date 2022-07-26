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
      this.setState(data);
    }
  }

  componentDidMount() {
    console.log("Oracle ComponentDidMount")
    this.getInfo()
    this.timer = setInterval(this.getInfo, 60000, null)
  }

  componentWillUnmount() {
    console.log("Oracle ComponentWillUnmount")
    clearInterval(this.timer)
  }

  render() {
    const keys = Object.keys(this.state)
    const subs = keys.map(key => {
      if (this.state[key].length > 0) {
        return <Fields title={this.state[key].title} columns={this.state[key].columns} data={this.state[key].data} />
      } else {
        return <div>Loading...</div>
      }
    })
    // let prices = <div>Loading...</div>;
    // let configs = <div>Loading...</div>;
    // let sgs = <div>Loading...</div>;
  
    // if (this.state.prices) {
    //   prices = <Fields title={this.state.prices.title} columns={this.state.prices.columns} data={this.state.prices.data} />
    // }
    // if (this.state.configs) {
    //   configs = <Fields title={this.state.configs.title} columns={this.state.configs.columns} data={this.state.configs.data} />
    // }
    // if (this.state.sgs && this.state.sgs.length > 0) {
    //   sgs = this.state.sgs.map(sg => {
    //     return <Fields title={sg.title} columns={sg.columns} data={sg.data} />
    //   })
    // }
    return (
      <div className='oracles'>
        {/* { prices }
        { configs }
        { sgs } */
        subs
      }
      </div>
    )
  }
}

export default Oracle
