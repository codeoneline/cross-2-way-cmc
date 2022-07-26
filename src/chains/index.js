import React, { Component } from 'react'
import './index.css'
import Fields from '../fields'
import chainState from '../utils/chain-state'

class Chains extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  getInfo = async () => {
    const data = await chainState.getChainInfo();
    if (data) {
      this.setState(data);
    }
  }

  componentDidMount() {
    console.log("Chains ComponentDidMount")
    this.getInfo()
    this.timer = setInterval(this.getInfo, 60000, null)
  }

  componentWillUnmount() {
    console.log("Chains ComponentWillUnmount")
    clearInterval(this.timer)
  }

  render() {
    if (this.state.columns && this.state.columns.length > 0) {
      return (
        <div className='chains'>
          <Fields title="Chains" columns={this.state.columns} data={this.state.data} />
        </div>
      )
    } else {
      return (
        <div className='chains'>
          <div>Loading...</div>
        </div>
      )
    }
  }
}

export default Chains
