import React, { useEffect, useMemo, useState } from 'react'

const API_URL = 'http://34.210.149.238:13200/pricesRaw'

function formatPrice(value) {
  const num = Number(value)
  if (!isFinite(num)) return value
  if (num === 0) return '0'
  if (num >= 1000) return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (num >= 1) return num.toFixed(4)
  if (num >= 0.01) return num.toFixed(6)
  return num.toFixed(10).replace(/0+$/, '').replace(/\.$/, '')
}

export default function PricePage() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [sortAsc, setSortAsc] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchPrices = async () => {
    try {
      setError(null)
      const res = await fetch(API_URL, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e.message || '请求失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
    // 每 30 秒自动刷新一次，可按需修改或删除
    const timer = setInterval(fetchPrices, 30000)
    return () => clearInterval(timer)
  }, [])

  const list = useMemo(() => {
    let arr = Object.entries(data).map(([symbol, price]) => ({
      symbol,
      price,
      priceNum: Number(price),
    }))

    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase()
      arr = arr.filter((item) => item.symbol.toLowerCase().includes(k))
    }

    if (sortAsc !== null) {
      arr = [...arr].sort((a, b) =>
        sortAsc ? a.priceNum - b.priceNum : b.priceNum - a.priceNum
      )
    }

    return arr
  }, [data, keyword, sortAsc])

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Token Price Board</h1>
          <div style={styles.meta}>
            {lastUpdated && (
              <span style={styles.updated}>
                更新于 {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button style={styles.button} onClick={fetchPrices}>
              刷新
            </button>
          </div>
        </div>

        <div style={styles.toolbar}>
          <input
            style={styles.input}
            placeholder="搜索币种，例如 wan / BTC"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            style={styles.button}
            onClick={() =>
              setSortAsc((prev) => (prev === null ? true : prev ? false : null))
            }
          >
            {sortAsc === null ? '按价格排序' : sortAsc ? '价格 ↑' : '价格 ↓'}
          </button>
        </div>

        {loading && <div style={styles.empty}>加载中…</div>}
        {error && !loading && (
          <div style={styles.error}>
            加载失败：{error}
            <div style={styles.errorHint}>
              若在 HTTPS 页面下访问，请改用 Vite 代理方式（见下方方案二）。
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div style={styles.grid}>
              {list.map(({ symbol, price }) => (
                <div key={symbol} style={styles.card}>
                  <div style={styles.symbol}>{symbol}</div>
                  <div style={styles.price}>${formatPrice(price)}</div>
                </div>
              ))}
            </div>
            {list.length === 0 && <div style={styles.empty}>没有匹配的币种</div>}
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f172a',
    padding: '32px 16px',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    color: '#e2e8f0',
  },
  container: { maxWidth: 1100, margin: '0 auto' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: 700, margin: 0, color: '#f8fafc' },
  meta: { display: 'flex', alignItems: 'center', gap: 12 },
  updated: { fontSize: 13, color: '#94a3b8' },
  toolbar: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  input: {
    flex: 1,
    minWidth: 200,
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
  },
  button: {
    padding: '10px 18px',
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#e2e8f0',
    fontSize: 14,
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 14,
  },
  card: {
    background: '#1e293b',
    borderRadius: 12,
    padding: '16px 18px',
    border: '1px solid #334155',
  },
  symbol: {
    fontSize: 14,
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 20,
    fontWeight: 700,
    color: '#38bdf8',
    wordBreak: 'break-all',
  },
  empty: { textAlign: 'center', color: '#64748b', padding: 40 },
  error: {
    textAlign: 'center',
    color: '#f87171',
    padding: 24,
    background: '#1e293b',
    borderRadius: 12,
    border: '1px solid #7f1d1d',
  },
  errorHint: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
}