import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import './index.css';
import Oracle from './Oracle';
import Fee from './Fee';
import Home from './Home';
import Debt from './Debt';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>  
        <Route path="/" element={<Home/>} exact />  
        <Route path="/oracle" element={<Oracle/>} />  
        <Route path="/fee" element={<Fee/>} />  
        <Route path="/debt" element={<Debt/>} />  
      </Routes>  
    </Router>

  </React.StrictMode>,
  document.getElementById('root')
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
