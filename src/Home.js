import React from 'react';  
import { Link } from 'react-router-dom';
import './Home.css';


const Home = () => {  
  return (
    <div>
      <h1>请选择您感兴趣的网页</h1>
      <nav>
        <ul className="nav-links">
          <li>
            <Link to="/debt">Debt</Link>
          </li>
          <li>
            <Link to="/tokenPair">TokenPair</Link>
          </li>
          <li>
            <Link to="/pool">Pool</Link>
          </li>
          <li>
            <Link to="/price">Price</Link>
          </li>
          <li>
            <Link to="/configuration">Configuration</Link>
          </li>
          <li>
            <Link to="/chainsInfo">Chains Info</Link>
          </li>
          <li>
            <Link to="/storemanGroups">Storeman Groups</Link>
          </li>
        </ul>
      </nav>
    </div>
  );  
};

export default Home;