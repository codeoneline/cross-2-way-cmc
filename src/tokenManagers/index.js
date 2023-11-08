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
      this.setState(data);
    }
  }

  componentDidMount() {
    console.log("Oracle ComponentDidMount")
    this.getInfo()
    // this.timer = setInterval(this.getInfo, 60000, null)
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