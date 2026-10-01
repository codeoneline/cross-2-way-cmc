import { useEffect, useMemo, useState } from 'react'

const API_URL = 'http://34.210.149.238:13200/configurationRaw'

// 把 chainID 十进制/十六进制都友好展示
function formatChainID(chainID) {
  const num = Number(chainID)
  if (!isFinite(num)) return chainID
  const hex = '0x' + num.toString(16)
  return `${num} (${hex})`
}

// 缩短地址显示：0x8331...7005
function shortenAddress(addr) {
  if (!addr || addr.length < 12) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function ConfigurationPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // 过滤/搜索/排序
  const [keyword, setKeyword] = useState('')
  const [onlyMultiChain, setOnlyMultiChain] = useState(false)
  const [sortKey, setSortKey] = useState(null) // 'chainID' | 'account' | null
  const [sortAsc, setSortAsc] = useState(true)

  const fetchData = async () => {
    try {
      setError(null)
      const res = await fetch(API_URL, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!Array.isArray(json)) throw new Error('返回数据不是数组')
      setData(json)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e.message || '请求失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const list = useMemo(() => {
    let arr = data.map((item) => ({
      chainID: item.chainID,
      account: item.account,
      isMultiChainOriginToken: String(item.isMultiChainOriginToken) === 'true',
    }))

    // 只显示多链原始代币
    if (onlyMultiChain) {
      arr = arr.filter((x) => x.isMultiChainOriginToken)
    }

    // 关键字搜索（chainID 或 account）
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase()
      arr = arr.filter(
        (x) =>
          String(x.chainID).toLowerCase().includes(k) ||
          String(x.account).toLowerCase().includes(k)
      )
    }

    // 排序
    if (sortKey) {
      arr = [...arr].sort((a, b) => {
        let va = a[sortKey]
        let vb = b[sortKey]
        if (sortKey === 'chainID') {
          va = Number(va)
          vb = Number(vb)
        } else {
          va = String(va).toLowerCase()
          vb = String(vb).toLowerCase()
        }
        if (va < vb) return sortAsc ? -1 : 1
        if (va > vb) return sortAsc ? 1 : -1
        return 0
      })
    }

    return arr
  }, [data, keyword, onlyMultiChain, sortKey, sortAsc])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const sortIndicator = (key) => {
    if (sortKey !== key) return ''
    return sortAsc ? ' ↑' : ' ↓'
  }

  // 统计信息
  const total = data.length
  const multiCount = data.filter(
    (x) => String(x.isMultiChainOriginToken) === 'true'
  ).length

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Configuration</h1>
            <div style={styles.subtitle}>
              共 {total} 条记录 · 多链原始代币 {multiCount} 条 · 当前显示 {list.length} 条
            </div>
          </div>
          <div style={styles.meta}>
            {lastUpdated && (
              <span style={styles.updated}>
                更新于 {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button style={styles.button} onClick={fetchData}>
              刷新
            </button>
          </div>
        </div>

        <div style={styles.toolbar}>
          <input
            style={styles.input}
            placeholder="搜索 chainID 或 account"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={onlyMultiChain}
              onChange={(e) => setOnlyMultiChain(e.target.checked)}
            />
            仅多链原始代币
          </label>
        </div>

        {loading && <div style={styles.empty}>加载中…</div>}
        {error && !loading && (
          <div style={styles.error}>
            加载失败：{error}
            <div style={styles.errorHint}>
              若在 HTTPS 页面下访问 HTTP 接口会被浏览器拦截，请使用 Vite 代理（见文末说明）。
            </div>
          </div>
        )}

        {!loading && !error && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th
                    style={{ ...styles.th, cursor: 'pointer' }}
                    onClick={() => handleSort('chainID')}
                  >
                    ChainID{sortIndicator('chainID')}
                  </th>
                  <th
                    style={{ ...styles.th, cursor: 'pointer' }}
                    onClick={() => handleSort('account')}
                  >
                    Account{sortIndicator('account')}
                  </th>
                  <th style={styles.th}>Is MultiChain Origin Token</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row, idx) => (
                  <tr
                    key={`${row.chainID}-${row.account}-${idx}`}
                    style={idx % 2 ? styles.trAlt : styles.tr}
                  >
                    <td style={styles.td}>
                      <span style={styles.chainID}>{row.chainID}</span>
                      <span style={styles.hex}>
                        {Number.isFinite(Number(row.chainID))
                          ? '0x' + Number(row.chainID).toString(16)
                          : ''}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        title={row.account}
                        style={styles.account}
                        onClick={() => navigator.clipboard?.writeText(row.account)}
                      >
                        {shortenAddress(row.account)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={
                          row.isMultiChainOriginToken
                            ? styles.badgeTrue
                            : styles.badgeFalse
                        }
                      >
                        {row.isMultiChainOriginToken ? 'true' : 'false'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && (
              <div style={styles.empty}>没有匹配的记录</div>
            )}
          </div>
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
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: 700, margin: 0, color: '#f8fafc' },
  subtitle: { fontSize: 13, color: '#94a3b8', marginTop: 6 },
  meta: { display: 'flex', alignItems: 'center', gap: 12 },
  updated: { fontSize: 13, color: '#94a3b8' },
  toolbar: {
    display: 'flex',
    gap: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 220,
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: '#cbd5e1',
    cursor: 'pointer',
    userSelect: 'none',
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
  tableWrapper: {
    background: '#1e293b',
    borderRadius: 12,
    border: '1px solid #334155',
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 600,
    color: '#94a3b8',
    borderBottom: '1px solid #334155',
    background: '#172033',
    userSelect: 'none',
  },
  tr: { background: 'transparent' },
  trAlt: { background: 'rgba(148,163,184,0.04)' },
  td: {
    padding: '12px 16px',
    fontSize: 14,
    borderBottom: '1px solid rgba(51,65,85,0.5)',
    verticalAlign: 'middle',
  },
  chainID: { color: '#38bdf8', marginRight: 8, fontVariantNumeric: 'tabular-nums' },
  hex: { color: '#64748b', fontSize: 12 },
  account: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    color: '#e2e8f0',
    cursor: 'pointer',
  },
  badgeTrue: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: 'rgba(34,197,94,0.15)',
    color: '#4ade80',
    border: '1px solid rgba(34,197,94,0.3)',
  },
  badgeFalse: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: 'rgba(148,163,184,0.12)',
    color: '#94a3b8',
    border: '1px solid rgba(148,163,184,0.25)',
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