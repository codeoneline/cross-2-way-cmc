const axios = require('axios');

// const url = 'http://localhost:3200/';
const url ='http://34.210.149.238:' + process.env.REACT_APP_PORT + '/'

class ChainState {
  getChainInfo = async () => {
    try {
      const data = (await axios.get(`${url}chains`)).data;
      return data;
    } catch (error) {
      console.log('request chains error: ' + error);
      return null;
    }
  }

  getOracles = async () => {
    try {
      const data = (await axios.get(`${url}oracles`)).data;
      return data;
    } catch (error) {
      console.log('request oracles error: ' + error);
      return null;
    }
  }

  getTokenManagers = async () => {
    try {
      const data = (await axios.get(`${url}tms`)).data;
      return data;
    } catch (error) {
      console.log('request token managers error: ' + error);
      return null;
    }
  }

  refreshTokenPairs = async () => {
    try {
      console.log("refreshing")
      const data = (await axios.get(`${url}tms/refresh`)).data;
      return data;
    } catch (error) {
      console.log('refresh TokenPairs error: ' + error);
      return null;
    }
  }
}


const chainState = new ChainState();

export default chainState;
