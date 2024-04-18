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
            <Link to="/oracle">Oracle</Link>
          </li>
          <li>
            <Link to="/fee">Fee</Link>
          </li>
        </ul>
      </nav>
    </div>
  );  
};

export default Home;