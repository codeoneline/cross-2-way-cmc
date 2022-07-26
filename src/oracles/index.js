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
    this.timer = setInterval(this.getInfo, 500000, null)
  }

  componentWillUnmount() {
    console.log("Oracle ComponentWillUnmount")
    clearInterval(this.timer)
  }

  render() {
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
