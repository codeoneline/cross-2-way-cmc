// utils/cache.js
const CACHE_KEY = 'defi_pools_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

const cacheService = {
  // 保存数据到缓存
  saveToCache: (data) => {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  },
  
  // 从缓存获取数据
  getFromCache: () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    
    // 检查缓存是否过期
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  },
  
  // 清除缓存
  clearCache: () => {
    localStorage.removeItem(CACHE_KEY);
  }
};

export default cacheService;