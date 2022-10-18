import React, { Component } from 'react';
import './App.css';
import Chains from './chains';
import Oracles from './oracles';
import TokenManagers from './tokenManagers';
import chainState from '../utils/chain-state'

class App extends Component {

  refreshTokenPairs = (e) => {
    e.preventDefault();
    chainState.refreshTokenPairs();
    alert('refreshTokenPairs success!');
  }

  render() {
    return (
      <>
        <div className='app'>
          <div className='title'>
            <div>cross chain oracle tokenManager contract states</div>
            <button onClick={ this.refreshTokenPairs }>tokenPair的数量没变, 但内容变时, 请手动更新!</button>
          </div>
        <div className='main'>
          <Chains />
          <Oracles />
          <TokenManagers />
        </div>
        </div>
      </>
    )
  }
}

export default App;
