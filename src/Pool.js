import React, { useState, useEffect, useMemo } from 'react';
import './Pool.css';
import cacheService from './utils/cache'

// 主组件
function PoolsPage() {
  const [pools, setPools] = useState([]);
  const [filteredPools, setFilteredPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // 筛选状态 - 增强搜索功能
  const [filters, setFilters] = useState({
    chain: 'all',
    chainSearch: '', // 新增：区块链搜索
    projectSearch: '', // 新增：项目搜索
    symbolSearch: '', // 新增：资产搜索
    minApy: 0,
    stablecoin: 'all',
    risk: 'all'
  });
  
  // 排序状态
  const [sortConfig, setSortConfig] = useState({
    key: 'tvlUsd',
    direction: 'desc'
  });
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 获取真实数据
  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 首先尝试从缓存获取
        const cachedData = cacheService.getFromCache();
        if (cachedData && cachedData.length > 0) {
          console.log('使用缓存数据');
          setPools(cachedData);
          setFilteredPools(cachedData);
          setLastUpdated(new Date().toLocaleString());
        }

        console.log('开始获取API数据...');
        
        // 使用真实的API端点
        const response = await fetch('https://yields.llama.fi/pools');
        
        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('API返回数据:', data);
        
        if (data && Array.isArray(data.data)) {
          // API返回的数据在data属性中
          const poolsData = data.data;
          
          console.log(`获取到 ${poolsData.length} 个流动性池`);
          
          // 过滤掉无效数据
          const validPools = poolsData.filter(pool => 
            pool && 
            pool.chain && 
            pool.symbol && 
            typeof pool.tvlUsd === 'number' &&
            typeof pool.apy === 'number'
          );
          
          console.log(`有效数据: ${validPools.length} 个`);
          
          setPools(validPools);
          setFilteredPools(validPools);
          setLastUpdated(new Date().toLocaleString());
        } else {
          throw new Error('API返回的数据格式不正确');
        }
      } catch (err) {
        console.error('获取数据时出错:', err);
        setError(`无法加载数据: ${err.message}`);
        
        // 如果API调用失败，使用模拟数据作为后备方案
        console.log('使用模拟数据作为后备方案');
        const mockData = generateMockData();
        setPools(mockData);
        setFilteredPools(mockData);
        setLastUpdated(new Date().toLocaleString());
      } finally {
        setLoading(false);
      }
    };
    
    fetchPools();
    
    // 可选：设置自动刷新，例如每5分钟刷新一次
    const refreshInterval = setInterval(() => {
      console.log('自动刷新数据...');
      fetchPools();
    }, 5 * 60 * 1000); // 5分钟
    
    return () => clearInterval(refreshInterval);
  }, []);

  // 应用筛选 - 增强搜索逻辑
  useEffect(() => {
    let result = [...pools];
    
    // 链筛选（下拉菜单）
    if (filters.chain !== 'all') {
      result = result.filter(pool => pool.chain === filters.chain);
    }
    
    // 区块链搜索（文本搜索）
    if (filters.chainSearch.trim()) {
      const searchTerm = filters.chainSearch.toLowerCase().trim();
      result = result.filter(pool => 
        pool.chain && pool.chain.toLowerCase().includes(searchTerm)
      );
    }
    
    // 项目搜索
    if (filters.projectSearch.trim()) {
      const searchTerm = filters.projectSearch.toLowerCase().trim();
      result = result.filter(pool => 
        pool.project && pool.project.toLowerCase().includes(searchTerm)
      );
    }
    
    // 资产搜索
    if (filters.symbolSearch.trim()) {
      const searchTerm = filters.symbolSearch.toLowerCase().trim();
      result = result.filter(pool => 
        pool.symbol && pool.symbol.toLowerCase().includes(searchTerm)
      );
    }
    
    // 最小APY筛选
    if (filters.minApy > 0) {
      result = result.filter(pool => pool.apy >= filters.minApy);
    }
    
    // 稳定币筛选
    if (filters.stablecoin !== 'all') {
      const isStable = filters.stablecoin === 'stable';
      result = result.filter(pool => pool.stablecoin === isStable);
    }
    
    // 风险筛选
    if (filters.risk !== 'all') {
      result = result.filter(pool => pool.ilRisk === filters.risk);
    }
    
    setFilteredPools(result);
    setCurrentPage(1); // 重置到第一页
  }, [filters, pools]);

  // 处理排序
  const sortedPools = useMemo(() => {
    const sortablePools = [...filteredPools];
    
    if (sortConfig.key) {
      sortablePools.sort((a, b) => {
        // 处理可能的null或undefined值
        const aVal = a[sortConfig.key] || (sortConfig.key === 'tvlUsd' ? 0 : '');
        const bVal = b[sortConfig.key] || (sortConfig.key === 'tvlUsd' ? 0 : '');
        
        // 如果是字符串，进行字符串比较
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          if (sortConfig.direction === 'asc') {
            return aVal.localeCompare(bVal);
          } else {
            return bVal.localeCompare(aVal);
          }
        }
        
        // 如果是数字，进行数字比较
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortablePools;
  }, [filteredPools, sortConfig]);

  // 请求排序
  const requestSort = (key) => {
    let direction = 'desc';
    
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    
    setSortConfig({ key, direction });
  };

  // 分页逻辑
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPools = sortedPools.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPools.length / itemsPerPage);

  // 获取唯一链列表
  // const uniqueChains = useMemo(() => {
  //   const chains = pools.map(pool => pool.chain).filter(Boolean);
  //   return [...new Set(chains)].sort();
  // }, [pools]);
  const uniqueChains = ['Ethereum','Arbitrum','Avalanche','Polygon', 'Optimism']

  // 获取唯一项目列表（用于搜索建议）
  // const uniqueProjects = useMemo(() => {
  //   const projects = pools.map(pool => pool.project).filter(Boolean);
  //   return [...new Set(projects)].sort();
  // }, [pools]);
  const uniqueProjects = ['aave-v3', 'compound-v3', 'compound-v2', 'venus-core-pool', 'benqi-lending']

  // 获取唯一资产列表（用于搜索建议）
  // const uniqueSymbols = useMemo(() => {
  //   const symbols = pools.map(pool => pool.symbol).filter(Boolean);
  //   return [...new Set(symbols)].sort();
  // }, [pools]);
  const uniqueSymbols = ['USDC', 'USDT', 'WETH', 'WBTC']

  // 处理筛选变化
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 清除单个搜索框
  const clearSearch = (fieldName) => {
    setFilters(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  // 快速设置筛选
  const quickFilter = (type, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (type === 'chain') {
        newFilters.chain = value;
      } else if (type === 'project') {
        newFilters.projectSearch = value;
      } else if (type === 'symbol') {
        newFilters.symbolSearch = value;
      }
      
      return newFilters;
    });
  };

  // 获取排序指示器
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // 格式化货币
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value?.toFixed(2) || '0.00'}`;
  };

  // 格式化百分比
  const formatPercent = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  // 获取APY变化颜色
  const getApyChangeColor = (value) => {
    if (value === null || value === undefined) return 'neutral';
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  // 获取预测类别颜色
  const getPredictionColor = (predictedClass) => {
    if (!predictedClass) return 'prediction-neutral';
    
    if (predictedClass.includes('Up') || predictedClass.includes('up')) {
      return 'prediction-up';
    } else if (predictedClass.includes('Down') || predictedClass.includes('down')) {
      return 'prediction-down';
    } else {
      return 'prediction-neutral';
    }
  };

  // 计算统计信息
  const stats = useMemo(() => {
    if (pools.length === 0) return null;
    
    const validTvlPools = pools.filter(pool => pool.tvlUsd > 0);
    const totalTVL = validTvlPools.reduce((sum, pool) => sum + pool.tvlUsd, 0);
    
    const validApyPools = pools.filter(pool => pool.apy !== null && pool.apy !== undefined);
    const avgAPY = validApyPools.length > 0 
      ? validApyPools.reduce((sum, pool) => sum + pool.apy, 0) / validApyPools.length
      : 0;
    
    const stablePools = pools.filter(pool => pool.stablecoin).length;
    const riskyPools = pools.filter(pool => pool.ilRisk === 'yes').length;
    
    return {
      totalTVL,
      avgAPY,
      stablePools,
      riskyPools,
      totalPools: pools.length
    };
  }, [pools]);

  // 处理手动刷新数据
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://yields.llama.fi/pools');
      
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data.data)) {
        const poolsData = data.data;
        const validPools = poolsData.filter(pool => 
          pool && 
          pool.chain && 
          pool.symbol && 
          typeof pool.tvlUsd === 'number' &&
          typeof pool.apy === 'number'
        );
        
        setPools(validPools);
        setFilteredPools(validPools);
        setLastUpdated(new Date().toLocaleString());
      }
    } catch (err) {
      console.error('刷新数据时出错:', err);
      setError(`刷新失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 重置所有筛选
  const resetAllFilters = () => {
    setFilters({
      chain: 'all',
      chainSearch: '',
      projectSearch: '',
      symbolSearch: '',
      minApy: 0,
      stablecoin: 'all',
      risk: 'all'
    });
  };

  // 获取当前活跃的筛选数量
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.chain !== 'all') count++;
    if (filters.chainSearch.trim()) count++;
    if (filters.projectSearch.trim()) count++;
    if (filters.symbolSearch.trim()) count++;
    if (filters.minApy > 0) count++;
    if (filters.stablecoin !== 'all') count++;
    if (filters.risk !== 'all') count++;
    return count;
  }, [filters]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>正在从Llama.fi加载DeFi池数据...</p>
        <p className="loading-note">这可能需要几秒钟时间</p>
      </div>
    );
  }

  if (error && pools.length === 0) {
    return (
      <div className="error-container">
        <h2>出错了</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={handleRefresh}>重试</button>
          <button onClick={() => window.location.reload()}>刷新页面</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pools-page">
      <header className="header">
        <div className="header-top">
          <h1>DeFi Pools 流动性挖矿数据</h1>
          <div className="header-actions">
            <button className="refresh-btn" onClick={handleRefresh}>
              🔄 刷新数据
            </button>
            {lastUpdated && (
              <span className="last-updated">最后更新: {lastUpdated}</span>
            )}
          </div>
        </div>
        <p className="subtitle">实时监控各个区块链上的流动性池表现 - 数据来源: Llama.fi</p>
      </header>
      
      {/* 错误提示（如果有错误但仍有数据） */}
      {error && pools.length > 0 && (
        <div className="warning-message">
          <p>⚠️ {error} (显示缓存数据)</p>
        </div>
      )}
      
      {/* 统计卡片 */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card">
            <h3>总锁仓价值 (TVL)</h3>
            <p className="stat-value">{formatCurrency(stats.totalTVL)}</p>
          </div>
          <div className="stat-card">
            <h3>平均APY</h3>
            <p className="stat-value">{formatPercent(stats.avgAPY)}</p>
          </div>
          <div className="stat-card">
            <h3>稳定币池</h3>
            <p className="stat-value">{stats.stablePools}</p>
          </div>
          <div className="stat-card">
            <h3>风险池</h3>
            <p className="stat-value">{stats.riskyPools}</p>
          </div>
          <div className="stat-card">
            <h3>总池数</h3>
            <p className="stat-value">{stats.totalPools}</p>
          </div>
        </div>
      )}
      
      {/* 搜索面板 */}
      <div className="search-section">
        <h3 className="search-section-title">🔍 精确搜索</h3>
        <div className="search-grid">
          {/* 区块链搜索 */}
          <div className="search-group">
            <label htmlFor="chainSearch" className="search-label">
              <span className="search-icon">⛓️</span> 区块链搜索
            </label>
            <div className="search-input-wrapper">
              <input
                type="text"
                id="chainSearch"
                name="chainSearch"
                placeholder="输入区块链名称 (如: Ethereum, BSC, Polygon)..."
                value={filters.chainSearch}
                onChange={handleFilterChange}
                className="search-input"
              />
              {filters.chainSearch && (
                <button 
                  className="clear-search-btn"
                  onClick={() => clearSearch('chainSearch')}
                  title="清除搜索"
                >
                  ✕
                </button>
              )}
            </div>
            {uniqueChains.length > 0 && (
              <div className="search-suggestions">
                <span className="suggestions-label">热门链:</span>
                {uniqueChains.slice(0, 8).map(chain => (
                  <button
                    key={chain}
                    className="suggestion-chip"
                    onClick={() => quickFilter('chain', chain)}
                  >
                    {chain}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* 项目搜索 */}
          <div className="search-group">
            <label htmlFor="projectSearch" className="search-label">
              <span className="search-icon">🏢</span> 项目搜索
            </label>
            <div className="search-input-wrapper">
              <input
                type="text"
                id="projectSearch"
                name="projectSearch"
                placeholder="输入项目名称 (如: aave, compound, uniswap)..."
                value={filters.projectSearch}
                onChange={handleFilterChange}
                className="search-input"
              />
              {filters.projectSearch && (
                <button 
                  className="clear-search-btn"
                  onClick={() => clearSearch('projectSearch')}
                  title="清除搜索"
                >
                  ✕
                </button>
              )}
            </div>
            {uniqueProjects.length > 0 && (
              <div className="search-suggestions">
                <span className="suggestions-label">热门项目:</span>
                {uniqueProjects.slice(0, 8).map(project => (
                  <button
                    key={project}
                    className="suggestion-chip"
                    onClick={() => quickFilter('project', project)}
                  >
                    {project}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* 资产搜索 */}
          <div className="search-group">
            <label htmlFor="symbolSearch" className="search-label">
              <span className="search-icon">💰</span> 资产搜索
            </label>
            <div className="search-input-wrapper">
              <input
                type="text"
                id="symbolSearch"
                name="symbolSearch"
                placeholder="输入资产符号 (如: USDC, ETH, BTC)..."
                value={filters.symbolSearch}
                onChange={handleFilterChange}
                className="search-input"
              />
              {filters.symbolSearch && (
                <button 
                  className="clear-search-btn"
                  onClick={() => clearSearch('symbolSearch')}
                  title="清除搜索"
                >
                  ✕
                </button>
              )}
            </div>
            {uniqueSymbols.length > 0 && (
              <div className="search-suggestions">
                <span className="suggestions-label">热门资产:</span>
                {uniqueSymbols.slice(0, 8).map(symbol => (
                  <button
                    key={symbol}
                    className="suggestion-chip"
                    onClick={() => quickFilter('symbol', symbol)}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 筛选面板 */}
      <div className="filters-panel">
        <div className="filters-header">
          <h3 className="filters-title">🎛️ 高级筛选</h3>
          <div className="filters-summary">
            {activeFilterCount > 0 && (
              <span className="active-filters-count">
                已应用 {activeFilterCount} 个筛选
              </span>
            )}
            <button 
              className="reset-all-btn"
              onClick={resetAllFilters}
              disabled={activeFilterCount === 0}
            >
              🗑️ 清除所有筛选
            </button>
          </div>
        </div>
        
        <div className="filters-grid">
          {/* 区块链下拉选择 */}
          <div className="filter-group">
            <label htmlFor="chain" className="filter-label">
              <span className="filter-icon">🌐</span> 选择区块链:
            </label>
            <select 
              id="chain" 
              name="chain" 
              value={filters.chain}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="all">全部区块链 ({uniqueChains.length})</option>
              {uniqueChains.map(chain => (
                <option key={chain} value={chain}>{chain}</option>
              ))}
            </select>
          </div>
          
          {/* 稳定币筛选 */}
          <div className="filter-group">
            <label htmlFor="stablecoin" className="filter-label">
              <span className="filter-icon">🔒</span> 稳定币:
            </label>
            <select 
              id="stablecoin" 
              name="stablecoin"
              value={filters.stablecoin}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="all">全部</option>
              <option value="stable">仅稳定币</option>
              <option value="non-stable">非稳定币</option>
            </select>
          </div>
          
          {/* 风险筛选 */}
          <div className="filter-group">
            <label htmlFor="risk" className="filter-label">
              <span className="filter-icon">⚠️</span> 无常损失风险:
            </label>
            <select 
              id="risk" 
              name="risk"
              value={filters.risk}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="all">全部</option>
              <option value="no">无风险</option>
              <option value="yes">有风险</option>
              <option value="null">未指定</option>
            </select>
          </div>
          
          {/* APY范围筛选 */}
          <div className="filter-group">
            <label htmlFor="minApy" className="filter-label">
              <span className="filter-icon">📈</span> 最小APY:
            </label>
            <div className="apy-filter-container">
              <input
                type="range"
                id="minApy"
                name="minApy"
                min="0"
                max="100"
                step="1"
                value={filters.minApy}
                onChange={handleFilterChange}
              />
              <div className="apy-value-display">
                <span className="apy-value">{filters.minApy}%</span>
                <div className="apy-presets">
                  <button 
                    className="apy-preset-btn"
                    onClick={() => setFilters(prev => ({ ...prev, minApy: 5 }))}
                  >
                    5%
                  </button>
                  <button 
                    className="apy-preset-btn"
                    onClick={() => setFilters(prev => ({ ...prev, minApy: 10 }))}
                  >
                    10%
                  </button>
                  <button 
                    className="apy-preset-btn"
                    onClick={() => setFilters(prev => ({ ...prev, minApy: 20 }))}
                  >
                    20%
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 结果计数 */}
      <div className="results-info">
        <div className="results-header">
          <h3>搜索结果</h3>
          <div className="results-stats">
            <span className="results-count">
              找到 {filteredPools.length} 个流动性池
              {currentPools.length < filteredPools.length && (
                <span className="paging-info"> (显示第 {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPools.length)} 个)</span>
              )}
            </span>
          </div>
        </div>
        
        {activeFilterCount > 0 && (
          <div className="active-filters">
            <span className="active-filters-label">已应用的筛选:</span>
            {filters.chain !== 'all' && (
              <span className="filter-tag">
                链: {filters.chain}
                <button 
                  className="filter-tag-remove"
                  onClick={() => setFilters(prev => ({ ...prev, chain: 'all' }))}
                >
                  ✕
                </button>
              </span>
            )}
            {filters.chainSearch && (
              <span className="filter-tag">
                链搜索: {filters.chainSearch}
                <button 
                  className="filter-tag-remove"
                  onClick={() => clearSearch('chainSearch')}
                >
                  ✕
                </button>
              </span>
            )}
            {filters.projectSearch && (
              <span className="filter-tag">
                项目: {filters.projectSearch}
                <button 
                  className="filter-tag-remove"
                  onClick={() => clearSearch('projectSearch')}
                >
                  ✕
                </button>
              </span>
            )}
            {filters.symbolSearch && (
              <span className="filter-tag">
                资产: {filters.symbolSearch}
                <button 
                  className="filter-tag-remove"
                  onClick={() => clearSearch('symbolSearch')}
                >
                  ✕
                </button>
              </span>
            )}
            {filters.minApy > 0 && (
              <span className="filter-tag">
                最小APY: {filters.minApy}%
                <button 
                  className="filter-tag-remove"
                  onClick={() => setFilters(prev => ({ ...prev, minApy: 0 }))}
                >
                  ✕
                </button>
              </span>
            )}
            {filters.stablecoin !== 'all' && (
              <span className="filter-tag">
                {filters.stablecoin === 'stable' ? '仅稳定币' : '非稳定币'}
                <button 
                  className="filter-tag-remove"
                  onClick={() => setFilters(prev => ({ ...prev, stablecoin: 'all' }))}
                >
                  ✕
                </button>
              </span>
            )}
            {filters.risk !== 'all' && (
              <span className="filter-tag">
                风险: {filters.risk === 'yes' ? '有风险' : filters.risk === 'no' ? '无风险' : '未指定'}
                <button 
                  className="filter-tag-remove"
                  onClick={() => setFilters(prev => ({ ...prev, risk: 'all' }))}
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* 表格 */}
      <div className="table-container">
        <table className="pools-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('chain')}>
                链 {getSortIndicator('chain')}
              </th>
              <th onClick={() => requestSort('project')}>
                项目 {getSortIndicator('project')}
              </th>
              <th onClick={() => requestSort('symbol')}>
                资产 {getSortIndicator('symbol')}
              </th>
              <th onClick={() => requestSort('tvlUsd')}>
                TVL {getSortIndicator('tvlUsd')}
              </th>
              <th onClick={() => requestSort('apy')}>
                APY {getSortIndicator('apy')}
              </th>
              <th onClick={() => requestSort('apyPct7D')}>
                7天变化 {getSortIndicator('apyPct7D')}
              </th>
              <th onClick={() => requestSort('apyPct30D')}>
                30天变化 {getSortIndicator('apyPct30D')}
              </th>
              <th onClick={() => requestSort('stablecoin')}>
                稳定币 {getSortIndicator('stablecoin')}
              </th>
              <th>预测</th>
              <th onClick={() => requestSort('ilRisk')}>
                风险 {getSortIndicator('ilRisk')}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentPools.map(pool => (
              <tr key={pool.pool || `${pool.chain}-${pool.project}-${pool.symbol}`}>
                <td>
                  <span className={`chain-badge chain-${pool.chain?.toLowerCase()}`}>
                    {pool.chain || 'Unknown'}
                  </span>
                </td>
                <td className="project-cell">
                  <div className="project-name" title={pool.project}>
                    {pool.project || 'N/A'}
                  </div>
                </td>
                <td>
                  <div className="symbol" title={pool.symbol}>
                    {pool.symbol || 'N/A'}
                  </div>
                </td>
                <td className="tvl-cell">
                  {formatCurrency(pool.tvlUsd)}
                </td>
                <td>
                  <div className="apy-cell">
                    <span className="apy-value">
                      {formatPercent(pool.apy)}
                    </span>
                    {pool.apyReward > 0 && (
                      <div className="apy-breakdown">
                        <span className="apy-base">基础: {formatPercent(pool.apyBase || 0)}</span>
                        <span className="apy-reward">奖励: {formatPercent(pool.apyReward)}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`apy-change ${getApyChangeColor(pool.apyPct7D)}`}>
                    {formatPercent(pool.apyPct7D)}
                  </span>
                </td>
                <td>
                  <span className={`apy-change ${getApyChangeColor(pool.apyPct30D)}`}>
                    {formatPercent(pool.apyPct30D)}
                  </span>
                </td>
                <td>
                  {pool.stablecoin ? (
                    <span className="stable-badge">是</span>
                  ) : (
                    <span className="non-stable-badge">否</span>
                  )}
                </td>
                <td>
                  {pool.predictions ? (
                    <span className={`prediction-badge ${getPredictionColor(pool.predictions.predictedClass)}`}>
                      {pool.predictions.predictedClass || 'N/A'} 
                      {pool.predictions.predictedProbability && ` (${pool.predictions.predictedProbability}%)`}
                    </span>
                  ) : (
                    <span className="prediction-badge prediction-neutral">N/A</span>
                  )}
                </td>
                <td>
                  <span className={`risk-badge risk-${pool.ilRisk || 'null'}`}>
                    {pool.ilRisk === 'yes' ? '高风险' : pool.ilRisk === 'no' ? '低风险' : '未指定'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {currentPools.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>没有找到匹配的流动性池</h3>
            <p>尝试调整您的筛选条件或清除所有筛选</p>
            <button className="clear-all-btn" onClick={resetAllFilters}>
              清除所有筛选
            </button>
          </div>
        )}
      </div>
      
      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← 上一页
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="page-ellipsis">...</span>
                <button 
                  onClick={() => setCurrentPage(totalPages)}
                  className="page-btn"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            下一页 →
          </button>
          
          <div className="page-info">
            第 {currentPage} 页，共 {totalPages} 页
          </div>
        </div>
      )}
      
      {/* 页脚信息 */}
      <footer className="footer">
        <p>数据来源: <a href="https://yields.llama.fi/pools" target="_blank" rel="noopener noreferrer">Llama.fi API</a> • 最后更新: {lastUpdated || 'N/A'}</p>
        <p className="disclaimer">
          注意: 此数据仅供参考，投资有风险，请谨慎决策。APY数据可能随时变化。
        </p>
      </footer>
    </div>
  );
}

// 保留模拟数据生成函数作为后备方案
function generateMockData() {
  const chains = ['BSC', 'Ethereum', 'Polygon', 'Avalanche', 'Arbitrum', 'Optimism'];
  const projects = [
    'venus-core-pool', 'aave-v3', 'compound-v2', 'curve-finance', 
    'uniswap-v3', 'pancakeswap', 'balancer', 'yearn-finance'
  ];
  const symbols = ['USDC', 'USDT', 'DAI', 'ETH', 'BTC', 'BNB', 'MATIC', 'AVAX'];
  const riskLevels = ['yes', 'no'];
  const predictedClasses = ['Stable/Up', 'Stable/Down', 'Volatile/Up', 'Volatile/Down'];
  
  const pools = [];
  
  for (let i = 0; i < 150; i++) {
    const chain = chains[Math.floor(Math.random() * chains.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const isStable = ['USDC', 'USDT', 'DAI'].includes(symbol);
    const tvlUsd = Math.random() * 50000000 + 1000000;
    const apyBase = Math.random() * 10 + 0.5;
    const apyReward = Math.random() > 0.7 ? Math.random() * 5 : 0;
    const apy = apyBase + apyReward;
    const apyPct7D = (Math.random() - 0.5) * 5;
    const apyPct30D = (Math.random() - 0.5) * 15;
    const ilRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const predictedClass = predictedClasses[Math.floor(Math.random() * predictedClasses.length)];
    const predictedProbability = Math.floor(Math.random() * 40) + 60;
    
    pools.push({
      chain,
      project,
      symbol,
      tvlUsd,
      apyBase,
      apyReward,
      apy,
      apyPct7D,
      apyPct30D,
      stablecoin: isStable,
      ilRisk,
      predictions: {
        predictedClass,
        predictedProbability,
        binnedConfidence: Math.floor(Math.random() * 5) + 1
      },
      pool: `pool-${i}-${Date.now()}`,
      rewardTokens: isStable ? [] : ['0x' + Math.random().toString(16).substr(2, 40)],
      poolMeta: null,
      mu: 5.33656,
      sigma: 0.19019,
      count: 1244,
      outlier: false,
      underlyingTokens: ['0x' + Math.random().toString(16).substr(2, 40)],
      il7d: null,
      apyBase7d: null,
      apyMean30d: apy + (Math.random() - 0.5) * 2,
      volumeUsd1d: null,
      volumeUsd7d: null,
      apyBaseInception: null,
    });
  }
  
  return pools;
}

export default PoolsPage;