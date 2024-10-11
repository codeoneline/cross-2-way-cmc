const axios = require('axios');

// const url = 'http://localhost:3200/';
const url ='http://34.210.149.238:' + process.env.REACT_APP_PORT + '/'

// const options = {
//   headers:{
//     accept: 'application/json',
//     'User-agent': 'learning app',
//   }
// }

let cache = {};
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

  getPrices = async (time) => {
    try {
      const data = (await axios.get(`${url}prices?time=${time}`)).data;
      return data;
    } catch (error) {
      console.log('request prices error: ' + error);
      return null;
    }
  }

  getGasPrices = async (time) => {
    try {
      const data = (await axios.get(`${url}gasPrices?time=${time}`)).data;
      return data;
    } catch (error) {
      console.log('request gas prices error: ' + error);
      return null;
    }
  }

  getFees = async (time) => {
    try {
      const data = (await axios.get(`${url}fees?time=${time}`)).data;
      console.log(`get fees ${time} : ${JSON.stringify(data)}`)
      return data;
    } catch (error) {
      console.log('request fees error: ' + error);
      return null;
    }
  }

  findFirstOldFee = async (srcChainID, destChainID, time) => {
    try {
      const data2 = await axios.get(`${url}findFirstOldFee?srcChainID=${srcChainID}&destChainID=${destChainID}&time=${time}`)
      const data = data2.data
      console.log(`find first old fee ${srcChainID} ->${destChainID} time <= ${time} : ${JSON.stringify(data)}`)
      return data;
    } catch (error) {
      console.log('request fees error: ' + error);
      return null;
    }
  }

  getTxs = async (time) => {
    try {
      const data = (await axios.get(`${url}tx?time=${time}`)).data;
      console.log(`get txs ${time} : ${JSON.stringify(data)}`)
      return data;
    } catch (error) {
      console.log('request txs error: ' + error);
      return null;
    }
  }

  getChains = async () => {
    try {
      const data = (await axios.get(`${url}supportChains`)).data;
      console.log(`get supportChains : ${JSON.stringify(data)}`)
      return data;
    } catch (error) {
      console.log('request supportChains error: ' + error);
      return null;
    }
  }

  getCrossAdminChains = async () => {
    try {
      const data = (await axios.get(`${url}crossAdminChains`)).data;
      console.log(`get crossAdminChains : ${JSON.stringify(data)}`)
      return data;
    } catch (error) {
      console.log('request crossAdminChains error: ' + error);
      return null;
    }
  }

  getLatestFees = async () => {
    try {
      const data = (await axios.get(`${url}latestFee`)).data;
      console.log(`get latest fee: ${JSON.stringify(data)}`)
      return data;
    } catch (error) {
      console.log('request latest fee error: ' + error);
      return null;
    }
  }

  getFeeCsv = async () => {
    try {
      const data = (await axios.get(`${url}getFeeCsv`)).data;
      console.log(`get fee csv: ${JSON.stringify(data)}`)
      return data;
    } catch (error) {
      console.log('request fee csv error: ' + error);
      return null;
    }
  }

  getTj = async () => {
    try {
      const data = (await axios.get(`${url}tj`)).data;
      console.log(`get t j: ${JSON.stringify(data)}`)
      return data;
    } catch (error) {
      console.log('request t j error: ' + error);
      return null;
    }
  }

  getChainsBk = async () => {
    try {
      const data = (await axios.get(`https://tokenpairs.wanpos.xyz/api/supportedChains/mainnet`)).data;
      if (data.success) {
        return data.data;
      } else {
        return null
      }
    } catch (error) {
      console.log('request chains error: ' + error);
      return null;
    }
  }

  fetchSupportedChains = async () => {
    let retVal = {
      supportedChains: [],
      supportedTokens: [],
      tokenPairs: [],
    }
    let network = 'mainnet';
    if (cache[network]) {
      console.log('cache hit');
      return cache[network];
    }
    try {
      const response = await fetch('https://tokenpairs.wanpos.xyz/api/supportedChains/' + network);
      const data = await response.json();
      console.log('supportedChains', data);
      retVal.supportedChains = data.data;
      retVal.supportedChains = retVal.supportedChains.filter(v=>v.chainName !== 'EOS' && v.chainName !== 'Songbird');
      retVal.supportedChains = retVal.supportedChains.map(v=>{
        return {
          ...v,
          chainSymbol: v.chainSymbol.includes('ETH') ? 'ETH' : v.chainSymbol,
        }
      });
  
      let pairHash = await fetch('https://tokenpairs.wanpos.xyz/api/tokenPairsHash/' + network);
      pairHash = await pairHash.json();
      console.log('pairHash', pairHash.data);
      let uniqueToken = [];
      let _tokenPairs = [];
      // compare with local storage
      const localHash = localStorage.getItem('tokenPairsHash_' + network);
      if (localHash !== pairHash.data) {
        console.log('different hash');
        localStorage.setItem('tokenPairsHash_' + network, pairHash.data);
        localStorage.removeItem('tokenPairs_' + network);
        let ret = await fetch('https://tokenpairs.wanpos.xyz/api/tokenPairs/' + network);
        ret = await ret.json();
        console.log(ret);
        localStorage.setItem('tokenPairs_' + network, JSON.stringify(ret.data));
        _tokenPairs = ret.data;
        uniqueToken = ret.data.filter((v, i, a) => 
          a.findIndex(t => (t.ancestorSymbol === v.ancestorSymbol)) === i
        ).map(v=>v.ancestorSymbol);
      } else {
        console.log('same hash');
        // load cached token pairs
        const localTokenPairs = localStorage.getItem('tokenPairs_' + network);
        if (localTokenPairs) {
          let pairs = JSON.parse(localTokenPairs);
          _tokenPairs = pairs;
          uniqueToken = pairs.filter((v, i, a) => 
            a.findIndex(t => (t.ancestorSymbol === v.ancestorSymbol)) === i
          ).map(v=>v.ancestorSymbol);
        }
      }
  
      retVal.tokenPairs = _tokenPairs;
      retVal.supportedTokens = uniqueToken;
  
    } catch (error) {
      console.error(error);
    }
    cache[network] = retVal;
    return retVal;
  }

}


const chainState = new ChainState();

export default chainState;
