import React, { Component } from 'react';
import './Oracle.css';
import Chains from './chains';
import Oracles from './oracles';
import chainState from './utils/chain-state'

class Oracle extends Component {


  render() {
    return (
      <div className='body'>
        <div className='app'>
          <div className='title'>
            <div>cross chain oracle tokenManager contract states  </div>
            
          </div>
        <div className='main'>
          <Chains />
          <Oracles />
        </div>
        </div>
      </div>
    )
  }
}

export default Oracle;
