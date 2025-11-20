import React, { useState, useMemo, useEffect } from 'react';
import './TokenPair.css';
import tokenPairData from './data/tokenPairData.json';
import chainState from './utils/chain-state'

// TokenPair页面组件
const TokenPair = ({ data }) => {
  const [selectedChain, setSelectedChain] = useState('ALL'); // 选中的链
  const [searchTerm, setSearchTerm] = useState(''); // 搜索关键词
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const itemsPerPage = 10; // 每页显示数量

  // 处理链选择
  const handleChainSelect = (chain) => {
    setSelectedChain(chain);
    setCurrentPage(1); // 切换链时重置到第一页
  };

  // 获取过滤后的tokenPairs
  const filteredTokenPairs = useMemo(() => {
    let pairs = [];

    // 如果选择ALL，合并所有链的tokenPairs
    if (selectedChain === 'ALL') {
      Object.values(data.gTokenPairs).forEach(chainPairs => {
        pairs = pairs.concat(Object.values(chainPairs));
      });
    } else if (data.gTokenPairs[selectedChain]) {
      // 选择特定链
      pairs = Object.values(data.gTokenPairs[selectedChain]);
    }

    // 应用搜索过滤
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      pairs = pairs.filter(pair => 
        pair.fromTokenSymbol?.toLowerCase().includes(lowerSearchTerm) ||
        pair.toTokenSymbol?.toLowerCase().includes(lowerSearchTerm) ||
        pair.fromTokenName?.toLowerCase().includes(lowerSearchTerm) ||
        pair.toTokenName?.toLowerCase().includes(lowerSearchTerm) ||
        getChainName(pair.fromChainID)?.toLowerCase().includes(lowerSearchTerm) ||
        getChainName(pair.toChainID)?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    return pairs;
  }, [selectedChain, searchTerm, data.gTokenPairs]);

  // 分页数据
  const paginatedTokenPairs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTokenPairs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTokenPairs, currentPage]);

  // 总页数
  const totalPages = Math.ceil(filteredTokenPairs.length / itemsPerPage);

  // 使用data中的chainMap获取链名称
  const getChainName = (chainId) => {
    return data.chainMap?.[chainId] || chainId;
  };

  return (
    <div className="token-pair-page">

      {/* 页面标题 */}
      <div className="page-header">
        
        <h1>Token Pairs</h1>
        <p>跨链代币配对信息</p>

      </div>

      {/* 统计卡片 */}
      <div className="stats-section">
        <div className="stats-card total">
          <h3>Total Token Pairs</h3>
          <div className="stats-number">
            {Object.values(data.gTotal).reduce((sum, count) => sum + count, 0)}
          </div>
        </div>
        
        <div className="stats-grid">
          {Object.entries(data.gTotal)
            .sort(([,a], [,b]) => b - a) // 按数量降序排列
            .map(([chain, count]) => (
              <div 
                key={chain}
                className={`stats-card chain ${selectedChain === chain ? 'selected' : ''}`}
                onClick={() => handleChainSelect(chain)}
              >
                <div className="chain-name">{chain}</div>
                <div className="chain-count">{count}</div>
              </div>
            ))
          }
        </div>
      </div>

      {/* 控制栏 */}
      <div className="controls-section">
        <div className="chain-selector">
          <button 
            className={`chain-btn ${selectedChain === 'ALL' ? 'active' : ''}`}
            onClick={() => handleChainSelect('ALL')}
          >
            All Chains
          </button>
          {Object.keys(data.gTotal)
            .filter(chain => data.gTotal[chain] > 0)
            .map(chain => (
              <button
                key={chain}
                className={`chain-btn ${selectedChain === chain ? 'active' : ''}`}
                onClick={() => handleChainSelect(chain)}
              >
                {chain} ({data.gTotal[chain]})
              </button>
            ))
          }
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="搜索代币符号、名称或链名称..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
      </div>

      {/* TokenPairs表格 */}
      <div className="table-section">
        <div className="table-header">
          <h3>
            {selectedChain === 'ALL' ? 'All Chains' : selectedChain} 
            ({filteredTokenPairs.length} pairs)
          </h3>
        </div>

        <div className="token-pairs-table">
          <div className="table-row header">
            <div className="col">ID</div>
            <div className="col">源链</div>
            <div className="col">目标链</div>
            <div className="col">源代币</div>
            <div className="col">目标代币</div>
            <div className="col">源地址</div>
            <div className="col">目标地址</div>
          </div>

          {paginatedTokenPairs.length > 0 ? (
            paginatedTokenPairs.map((pair) => (
              <TokenPairRow 
                key={`${pair.chainId}-${pair.id}`} 
                pair={pair} 
                getChainName={getChainName}
              />
            ))
          ) : (
            <div className="no-data">没有找到匹配的Token Pairs</div>
          )}
        </div>

        {/* 分页控件 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="pagination-btn"
            >
              上一页
            </button>
            
            <span className="page-info">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
            
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="pagination-btn"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// TokenPair行组件
const TokenPairRow = ({ pair, getChainName }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="table-row" onClick={() => setExpanded(!expanded)}>
        <div className="col">{pair.id}</div>
        <div className="col">{getChainName(pair.fromChainID)}</div>
        <div className="col">{getChainName(pair.toChainID)}</div>
        <div className="col">
          <div className="token-info">
            <span className="symbol">{pair.fromTokenSymbol}</span>
            <span className="name">{pair.fromTokenName}</span>
          </div>
        </div>
        <div className="col">
          <div className="token-info">
            <span className="symbol">{pair.toTokenSymbol}</span>
            <span className="name">{pair.toTokenName}</span>
          </div>
        </div>
        <div className="col address">
          {shortenAddress(pair.fromAccount)}
        </div>
        <div className="col address">
          {shortenAddress(pair.toAccount)}
        </div>
      </div>

      {/* 展开的详细信息 */}
      {expanded && (
        <div className="expanded-details">
          <div className="detail-row">
            <div className="detail-item">
              <label>源链ID:</label>
              <span>{pair.fromChainID} ({getChainName(pair.fromChainID)})</span>
            </div>
            <div className="detail-item">
              <label>目标链ID:</label>
              <span>{pair.toChainID} ({getChainName(pair.toChainID)})</span>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-item">
              <label>源代币精度:</label>
              <span>{pair.fromTokenDecimals}</span>
            </div>
            <div className="detail-item">
              <label>目标代币精度:</label>
              <span>{pair.toTokenDecimals}</span>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-item full-width">
              <label>源地址:</label>
              <span className="full-address">{pair.fromAccount}</span>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-item full-width">
              <label>目标地址:</label>
              <span className="full-address">{pair.toAccount}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// 工具函数
const shortenAddress = (address) => {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
};

export default function TokenPairPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    gTokenPairs: {},
    gTotal: {},
    chainMap: {},
  })
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await chainState.getTokenPair();
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
  return <TokenPair data={data} />
}