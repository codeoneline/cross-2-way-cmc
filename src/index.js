import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import './index.css';
import Oracle from './Oracle';
import Fee from './Fee';
import Home from './Home';
import Debt from './Debt';
import TokenPair from './TokenPair';
import Pool from './Pool';
import Price from './Prices';
import ConfigurationPage from './Configuration';
import ChainsInfoPage from './ChainsInfo';
import StoremanGroupsConfigPage from './StoremanGroups';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>  
        <Route path="/" element={<Home/>} exact />  
        <Route path="/oracle" element={<Oracle/>} />  
        <Route path="/fee" element={<Fee/>} />  
        <Route path="/debt" element={<Debt/>} />  
        <Route path="/tokenPair" element={<TokenPair/>} />  
        <Route path="/pool" element={<Pool/>} />  
        <Route path="/price" element={<Price/>} /> 
        <Route path="/configuration" element={<ConfigurationPage/>} /> 
        <Route path="/chainsInfo" element={<ChainsInfoPage/>} />
        <Route path="/storemanGroups" element={<StoremanGroupsConfigPage/>} />
      </Routes>  
    </Router>

  </React.StrictMode>,
  document.getElementById('root')
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
