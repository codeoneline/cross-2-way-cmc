import React, { useState, useEffect } from 'react';
import './Debt.css';
import chainState from './utils/chain-state'

const AssetDebt = ({data}) => {
  const [selectedToken, setSelectedToken] = useState(null);


  // 解析goodMsgs中的token信息
  const parseGoodToken = (msg) => {
    const symbolMatch = msg.match(/symbol=(\w+)/);
    const assetMatch = msg.match(/asset=([\d.]+)/);
    const debtMatch = msg.match(/debt=([\d.]+)/);
    
    return {
      symbol: symbolMatch ? symbolMatch[1] : '',
      asset: assetMatch ? parseFloat(assetMatch[1]) : 0,
      debt: debtMatch ? parseFloat(debtMatch[1]) : 0,
      isGood: true
    };
  };

  // 解析errMsgs中的token信息
  const parseErrToken = (msg) => {
    const symbolMatch = msg.match(/symbol=(\w+)/);
    const assetMatch = msg.match(/asset=([\d.]+)/);
    const debtMatch = msg.match(/debt=([\d.]+)/);
    
    return {
      symbol: symbolMatch ? symbolMatch[1] : '',
      asset: assetMatch ? parseFloat(assetMatch[1]) : 0,
      debt: debtMatch ? parseFloat(debtMatch[1]) : 0,
      isGood: false
    };
  };

  const parseExcpToken = (msg) => {
    const separatorIndex = msg.indexOf(': ');
   const symbol = msg.substring(0, separatorIndex);
   const error = msg.substring(separatorIndex + 2); // +2 是为了跳过 ": " 这两个字符
    return {
      symbol: symbol ? symbol : '',
      error: error ? error : '',
      isGood: false,
      msg: msg
    };
  }

  // 解析详情数据
  const parseDetail = (detailStr, type) => {
    const parts = detailStr.split(', ');
    const chain = parts[0];
    const token = parts[1];
    const chainId = parts[2];
    let addressInfo = parts[3]
    let index = 4
    if (parts.length === 7) {
      addressInfo = parts[index++]
    } 
    const amountInfo = parts[index++];
    const decimalsInfo = parts[index];
    
    const amountMatch = amountInfo.match(/is ([\d.]+)/);
    const decimalsMatch = decimalsInfo.match(/is (\d+)/);
    
    return {
      chain,
      token,
      chainId,
      address: addressInfo,
      amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
      decimals: decimalsMatch ? parseInt(decimalsMatch[1]) : 0,
      type: type,
      rawData: detailStr
    };
  };

  const handleTokenClick = (token) => {
    setSelectedToken(token);
  };

  const handleBackClick = () => {
    setSelectedToken(null);
  };

  const goodTokens = data.goodMsgs.map(parseGoodToken);
  const errTokens = data.errMsgs.map(parseErrToken);
  const excpTokens = data.excpMsgs.map(parseExcpToken);
  const allTokens = [...goodTokens, ...errTokens];

  // 计算总资产和总债务
  const calculateTotals = (tokenSymbol) => {
    const assetDetails = data.assetsDetail[tokenSymbol] || [];
    const debtDetails = data.debtsDetail[tokenSymbol] || [];
    
    const totalAsset = assetDetails.reduce((sum, detailStr) => {
      const detail = parseDetail(detailStr, 'asset');
      return sum + detail.amount;
    }, 0);
    
    const totalDebt = debtDetails.reduce((sum, detailStr) => {
      const detail = parseDetail(detailStr, 'debt');
      return sum + detail.amount;
    }, 0);
    
    return { totalAsset, totalDebt };
  };

  return (
    <div className="asset-debt-container">
      <h1>资产与债务概览</h1>
      
      {/* 错误统计 */}
      <div className="error-summary">
        <h2>错误统计</h2>
        <p>总错误数: <span className="error-count">{data.errCount}</span></p>
        {excpTokens.length > 0 && (
          <div className="exception-tokens">
            <h3>异常Token:</h3>
            <ul>
              {excpTokens.map((token, index) => {
                return (
                  <ul 
                    key={index} 
                    className="exception-token" 
                    onClick={() => handleTokenClick(token)}
                    >{`${token.msg.trim()}`}</ul>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {!selectedToken ? (
        /* 概览页面 */
        <div className="overview">
          {/* 健康资产 */}
          <div className="section">
            <h2>健康资产 (Asset ≥ Debt)</h2>
            <div className="token-grid">
              {goodTokens.map((token, index) => (
                <div 
                  key={index} 
                  className="token-card good"
                  onClick={() => handleTokenClick(token)}
                >
                  <h3>{token.symbol}</h3>
                  <p>资产: {token.asset.toFixed(6)}</p>
                  <p>债务: {token.debt.toFixed(6)}</p>
                  <p>差额: <span className="positive-diff">+{(token.asset - token.debt).toFixed(6)}</span></p>
                  <p className="status-good">状态: 健康</p>
                </div>
              ))}
            </div>
          </div>

          {/* 问题资产 */}
          <div className="section">
            <h2>问题资产 (Asset &lt; Debt)</h2>
            <div className="token-grid">
              {errTokens.map((token, index) => (
                <div 
                  key={index} 
                  className="token-card error"
                  onClick={() => handleTokenClick(token)}
                >
                  <h3>{token.symbol}</h3>
                  <p>资产: {token.asset.toFixed(6)}</p>
                  <p>债务: {token.debt.toFixed(6)}</p>
                  <p>差额: <span className="negative-diff">-{(token.debt - token.asset).toFixed(6)}</span></p>
                  <p className="status-error">状态: 风险</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 详情页面 */
        <div className="detail-view">
          <button className="back-button" onClick={handleBackClick}>
            ← 返回概览
          </button>
          
          <div className="token-header">
            <h2>{selectedToken.symbol} 详情</h2>
            <div className="token-summary">
              <div className="summary-card asset-summary">
                <h3>总资产</h3>
                <p className="amount">{calculateTotals(selectedToken.symbol).totalAsset.toFixed(6)}</p>
              </div>
              <div className="summary-card debt-summary">
                <h3>总债务</h3>
                <p className="amount">{calculateTotals(selectedToken.symbol).totalDebt.toFixed(6)}</p>
              </div>
              <div className={`summary-card ${selectedToken.isGood ? 'good-summary' : 'error-summary'}`}>
                <h3>净额</h3>
                <p className={`amount ${selectedToken.isGood ? 'positive' : 'negative'}`}>
                  {(calculateTotals(selectedToken.symbol).totalAsset - calculateTotals(selectedToken.symbol).totalDebt).toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          <div className="detail-tabs">
            {/* 资产详情 */}
            <div className="detail-section">
              <h3>资产详情</h3>
              <div className="detail-table-container">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>链</th>
                      <th>代币</th>
                      <th>链ID</th>
                      <th>地址</th>
                      <th>金额</th>
                      <th>精度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.assetsDetail[selectedToken.symbol]?.map((detailStr, index) => {
                      const detail = parseDetail(detailStr, 'asset');
                      return (
                        <tr key={index}>
                          <td>{detail.chain}</td>
                          <td>{detail.token}</td>
                          <td>{detail.chainId}</td>
                          <td>{detail.address}</td>
                          {/* <td className="address-cell">
                            <span title={detail.address}>
                              {detail.address.length > 20 
                                ? `${detail.address.substring(0, 10)}...${detail.address.substring(detail.address.length - 8)}`
                                : detail.address
                              }
                            </span>
                          </td> */}
                          <td className="asset-amount">{detail.amount.toFixed(6)}</td>
                          <td>{detail.decimals}</td>
                        </tr>
                      );
                    })}
                    {!data.assetsDetail[selectedToken.symbol] && (
                      <tr>
                        <td colSpan="6" className="no-data">暂无资产数据</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 债务详情 */}
            <div className="detail-section">
              <h3>债务详情</h3>
              <div className="detail-table-container">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>链</th>
                      <th>代币</th>
                      <th>链ID</th>
                      <th>地址</th>
                      <th>金额</th>
                      <th>精度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.debtsDetail[selectedToken.symbol]?.map((detailStr, index) => {
                      const detail = parseDetail(detailStr, 'debt');
                      return (
                        <tr key={index}>
                          <td>{detail.chain}</td>
                          <td>{detail.token}</td>
                          <td>{detail.chainId}</td>
                          <td>{detail.address}</td>
                          {/* <td className="address-cell">
                            <span title={detail.address}>
                              {detail.address.length > 20 
                                ? `${detail.address.substring(0, 10)}...${detail.address.substring(detail.address.length - 8)}`
                                : detail.address
                              }
                            </span>
                          </td> */}
                          <td className="debt-amount">{detail.amount.toFixed(6)}</td>
                          <td>{detail.decimals}</td>
                        </tr>
                      );
                    })}
                    {!data.debtsDetail[selectedToken.symbol] && (
                      <tr>
                        <td colSpan="6" className="no-data">暂无债务数据</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DebtDisplayPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    errCount: 0,
    errMsgs: [],
    excpMsgs: [],
    goodMsgs: [],
    assetsDetail: {},
    debtsDetail: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await chainState.getDebt();
        setData(result);
      } catch (err) {
        setError(err.message || '加载数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div>
              <h3 className="text-red-800 font-semibold">错误</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AssetDebt data={data} />;
}