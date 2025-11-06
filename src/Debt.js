import React, { useState, useEffect } from 'react';
import './Debt.css';
import chainState from './utils/chain-state'

const AssetDebt = ({data}) => {
  const [selectedToken, setSelectedToken] = useState(null);
  const [detailType, setDetailType] = useState(''); // 'asset' 或 'debt'

  // const data = {
  //   "errCount": 3,
  //   "excpMsgs": [" ADA", " LTC"],
  //   "errMsgs": ["token symbol=DOT, asset=0, debt=1475.7766098329; "],
  //   "goodMsgs": [
  //     "token symbol=ETH is good, asset=444.366233998770988439, debt=444.092275770925938674; ",
  //     "token symbol=BTC is good, asset=43.355830180176235594, debt=42.63004659; ",
  //   ],
  //   "assetsDetail": {
  //     "BTC": [
  //       "BTC, BTC, 2147483648, smg Aries_059 = bc1p42qsv4zsnv2fdrd6z9f8vgtzl7fszc2jt7gnl8r83wx5d8flnr3ss7hmhn, coin asset is 27.40301086, decimals is 8",
  //       "BTC, BTC, 2147483648, smg Aries_060 = bc1pjm4unt2zpy3tyjvv3h7qycnulxgtfftz95mahv0a02rmqng03zzqzktlue, coin asset is 0, decimals is 8",
  //       // ... 其他BTC资产详情
  //     ],
  //     "ETH": [
  //       "ETH, ETH, 2147483708, 0x0000000000000000000000000000000000000000, coin asset is 99.052788987102174071, decimals is 18",
  //       "ARB, ETH, 1073741826, 0x0000000000000000000000000000000000000000, coin asset is 8.25642928075948522, decimals is 18",
  //       // ... 其他ETH资产详情
  //     ],
  //   },
  //   "debtsDetail": {
  //     "DOT": [
  //       "WAN, DOT, 2153201998, account = 0x52f44783bdf480e88c0ed4cf341a933cacfdbcaa, mappingToken debt is 428.6149421804, decimals is 10",
  //       "AVAX, DOT, 2147492648, account = 0xd38bfdbfe7002ca56a1e05606e75aef5c521fff9, mappingToken debt is 111.0779, decimals is 10",
  //       // ... 其他DOT债务详情
  //     ]
  //   },
  // };

  // 解析goodMsgs中的token信息
  const parseGoodToken = (msg) => {
    const symbolMatch = msg.match(/symbol=(\w+)/);
    const assetMatch = msg.match(/asset=([\d.]+)/);
    const debtMatch = msg.match(/debt=([\d.]+)/);
    
    return {
      symbol: symbolMatch ? symbolMatch[1] : '',
      asset: assetMatch ? parseFloat(assetMatch[1]) : 0,
      debt: debtMatch ? parseFloat(debtMatch[1]) : 0,
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
    };
  };

  // 解析详情数据
  const parseDetail = (detailStr) => {
    const parts = detailStr.split(', ');
    const chain = parts[0];
    const token = parts[1];
    const chainId = parts[2];
    const addressInfo = parts[3];
    const amountInfo = parts[4];
    const decimalsInfo = parts[5];
    
    const amountMatch = amountInfo.match(/is ([\d.]+)/);
    const decimalsMatch = decimalsInfo.match(/is (\d+)/);
    
    return {
      chain,
      token,
      chainId,
      address: addressInfo,
      amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
      decimals: decimalsMatch ? parseInt(decimalsMatch[1]) : 0,
      type: amountInfo.includes('asset') ? 'asset' : 'debt',
      rawData: detailStr
    };
  };

  const handleTokenClick = (token, type) => {
    setSelectedToken(token);
    setDetailType(type);
  };

  const handleBackClick = () => {
    setSelectedToken(null);
    setDetailType('');
  };

  const goodTokens = data.goodMsgs.map(parseGoodToken);
  const errTokens = data.errMsgs.map(parseErrToken);

  return (
    <div className="asset-debt-container">
      <h1>资产与债务概览</h1>
      
      {/* 错误统计 */}
      <div className="error-summary">
        <h2>错误统计</h2>
        <p>总错误数: <span className="error-count">{data.errCount}</span></p>
        {data.excpMsgs.length > 0 && (
          <div className="exception-tokens">
            <h3>异常Token:</h3>
            <ul>
              {data.excpMsgs.map((token, index) => (
                <li key={index} className="exception-token">{token.trim()}</li>
              ))}
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
                  onClick={() => handleTokenClick(token.symbol, 'asset')}
                >
                  <h3>{token.symbol}</h3>
                  <p>资产: {token.asset.toFixed(6)}</p>
                  <p>债务: {token.debt.toFixed(6)}</p>
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
                  onClick={() => handleTokenClick(token.symbol, 'debt')}
                >
                  <h3>{token.symbol}</h3>
                  <p>资产: {token.asset.toFixed(6)}</p>
                  <p>债务: {token.debt.toFixed(6)}</p>
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
          
          <h2>{selectedToken} 的{detailType === 'asset' ? '资产' : '债务'}详情</h2>
          
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
                {(detailType === 'asset' 
                  ? data.assetsDetail[selectedToken] 
                  : data.debtsDetail[selectedToken]
                )?.map((detailStr, index) => {
                  const detail = parseDetail(detailStr);
                  return (
                    <tr key={index}>
                      <td>{detail.chain}</td>
                      <td>{detail.token}</td>
                      <td>{detail.chainId}</td>
                      <td className="address-cell">
                        <span title={detail.address}>
                          {detail.address.length > 20 
                            ? `${detail.address.substring(0, 10)}...${detail.address.substring(detail.address.length - 8)}`
                            : detail.address
                          }
                        </span>
                      </td>
                      <td>{detail.amount.toFixed(6)}</td>
                      <td>{detail.decimals}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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