import React, { Component } from 'react';
import './index.css';
import chainState from '../utils/chain-state'

class Title extends Component {

  refreshTokenPairs = (e) => {
    e.preventDefault();
    chainState.refreshTokenPairs();
    alert('refreshTokenPairs success!');
  }

  render() {
    return (
      <div className="tt">
        <div> Oracle TokenManager Monitor </div>
        <button onClick={ this.refreshTokenPairs }>tokenPair的数量没变, 但内容变时, 请手动更新!</button>
      </div>
    )
  }
}

export default Title
