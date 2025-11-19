import React, { Component } from 'react';
import './Oracle.css';
import Chains from './chains';
import Oracles from './oracles';
import TokenManagers from './tokenManagers';
import chainState from './utils/chain-state'

class Oracle extends Component {

  refreshTokenPairs = (e) => {
    e.preventDefault();
    chainState.refreshTokenPairs();
    alert('refreshTokenPairs success!');
  }

  render() {
    return (
      <div className='body'>
        <div className='app'>
          <div className='title'>
            <a href="./fee.js">fee</a>
            <div>cross chain oracle tokenManager contract states    <button onClick={ this.refreshTokenPairs }>tokenPair的数量没变, 但内容变时, 请点我手动更新!</button></div>
            
          </div>
        <div className='main'>
          <Chains />
          <Oracles />
          <TokenManagers />
        </div>
        </div>
      </div>
    )
  }
}

export default Oracle;
