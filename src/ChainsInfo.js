import React, { useEffect, useMemo, useState } from 'react'
import { copyText } from './utils/clipboard'
import { API } from './utils/api'
const API_URL = API.chains

// 关键字段（卡片折叠时优先展示）
const KEY_FIELDS = [
  'blockNumber',
  'chainId',
  'crossChainId',
  'multiCall',
  'oracleProxy',
  'tokenManagerProxy',
  'crossAddress',
]

// 字段中文标签
const FIELD_LABELS = {
  blockNumber: '最新区块',
  multiCall: 'MultiCall',
  oracleProxy: 'Oracle Proxy',
  oracleDelegator: 'Oracle Delegator',
  tokenManagerProxy: 'TokenManager Proxy',
  tokenManagerDelegator: 'TokenManager Delegator',
  oracleOwner: 'Oracle Owner',
  oracleAdmin: 'Oracle Admin',
  tokenManagerProxyOwner: 'TokenManager Proxy Owner',
  tokenManagerDelegatorOwner: 'TokenManager Delegator Owner',
  crossOwner: 'Cross Owner',
  crossAdmin: 'Cross Admin',
  smgFeeProxy: 'SMG Fee Proxy',
  signatureOwner: 'Signature Owner',
  crossAddress: 'Cross Address',
  signatureAddress: 'Signature Address',
  groupApprove: 'Group Approve',
  groupApproveOwner: 'Group Approve Owner',
  configAdmin: 'Config Admin',
  configOperator: 'Config Operator',
  currentStoreman0: 'Storeman #0',
  currentStoreman1: 'Storeman #1',
  chainId: 'ChainID',
  crossChainId: 'CrossChainID',
}

// 判断是否为地址类字段
function isAddressField(key) {
  return (
    /address|proxy|delegator|owner|admin|storeman|multiCall|smgFee/i.test(key) &&
    key !== 'crossChainId'
  )
}

function shorten(addr, head = 6, tail = 4) {
  if (!addr || typeof addr !== 'string') return addr
  if (addr.length <= head + tail + 3) return addr
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`
}

function isZeroAddress(addr) {
  return (
    typeof addr === 'string' &&
    /^0x0+$/.test(addr.toLowerCase())
  )
}

function CopyableAddress({ value }) {
  const [copied, setCopied] = useState(false)

  if (!value) return <span style={styles.emptyValue}>—</span>

  const handleCopy = () => {
    copyText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    })
  }

  return (
    <span
      title={value}
      onClick={handleCopy}
      style={{
        ...styles.address,
        color: isZeroAddress(value) ? '#64748b' : '#e2e8f0',
      }}
    >
      {shorten(value)}
      {copied && <span style={styles.copiedTag}>已复制</span>}
    </span>
  )
}

function ChainCard({ name, info, expanded, onToggle }) {
  const fields = Object.keys(info)

  // 折叠状态只显示关键字段
  const visibleFields = expanded
    ? fields
    : KEY_FIELDS.filter((k) => fields.includes(k))

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader} onClick={onToggle}>
        <div style={styles.chainName}>
          <span style={styles.dot} />
          {name}
        </div>
        <div style={styles.headerRight}>
          <span style={styles.chainIdBadge}>
            chainId {info.chainId ?? '—'}
          </span>
          <span style={styles.toggleIcon}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      <table style={styles.fieldTable}>
        <tbody>
          {visibleFields.map((key) => {
            const value = info[key]
            const isAddr = isAddressField(key)
            const isZero = isAddr && isZeroAddress(value)

            return (
              <tr key={key} style={styles.fieldRow}>
                <td style={styles.fieldKey}>{FIELD_LABELS[key] || key}</td>
                <td style={styles.fieldValue}>
                  {value === '' || value === null || value === undefined ? (
                    <span style={styles.emptyValue}>—</span>
                  ) : isAddr ? (
                    <CopyableAddress value={value} />
                  ) : (
                    <span
                      style={{
                        ...styles.plainValue,
                        color: isZero ? '#64748b' : '#e2e8f0',
                      }}
                    >
                      {String(value)}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {!expanded && fields.length > KEY_FIELDS.length && (
        <div style={styles.moreHint} onClick={onToggle}>
          还有 {fields.length - visibleFields.length} 个字段，点击展开
        </div>
      )}
    </div>
  )
}

export default function ChainsInfoPage() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [expandAll, setExpandAll] = useState(false)
  const [expandedSet, setExpandedSet] = useState(() => new Set())

  const fetchData = async () => {
    try {
      setError(null)
      const res = await fetch(API_URL, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (typeof json !== 'object' || Array.isArray(json)) {
        throw new Error('返回数据格式不是对象')
      }
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

  const chainNames = useMemo(() => {
    const names = Object.keys(data)
    if (!keyword.trim()) return names
    const k = keyword.trim().toLowerCase()
    return names.filter((n) => n.toLowerCase().includes(k))
  }, [data, keyword])

  const toggleOne = (name) => {
    setExpandedSet((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleExpandAll = () => {
    if (expandAll) {
      setExpandedSet(new Set())
      setExpandAll(false)
    } else {
      setExpandedSet(new Set(chainNames))
      setExpandAll(true)
    }
  }

  const isExpanded = (name) => expandAll || expandedSet.has(name)

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Chains Info</h1>
            <div style={styles.subtitle}>
              共 {Object.keys(data).length} 条链 · 当前显示 {chainNames.length} 条
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
            <button style={styles.button} onClick={handleExpandAll}>
              {expandAll ? '全部折叠' : '全部展开'}
            </button>
          </div>
        </div>

        <div style={styles.toolbar}>
          <input
            style={styles.input}
            placeholder="搜索链名，例如 WAN / ASTR"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {loading && <div style={styles.empty}>加载中…</div>}

        {error && !loading && (
          <div style={styles.error}>
            加载失败：{error}
            <div style={styles.errorHint}>
              若在 HTTPS 页面下访问 HTTP 接口会被浏览器拦截，请使用 Vite 代理（见文末）。
            </div>
          </div>
        )}

        {!loading && !error && (
          <div style={styles.grid}>
            {chainNames.map((name) => (
              <ChainCard
                key={name}
                name={name}
                info={data[name]}
                expanded={isExpanded(name)}
                onToggle={() => toggleOne(name)}
              />
            ))}
            {chainNames.length === 0 && (
              <div style={styles.empty}>没有匹配的链</div>
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
  container: { maxWidth: 1200, margin: '0 auto' },
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
  meta: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  updated: { fontSize: 13, color: '#94a3b8' },
  toolbar: { marginBottom: 20 },
  input: {
    width: '100%',
    maxWidth: 400,
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#1e293b',
    borderRadius: 12,
    border: '1px solid #334155',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    cursor: 'pointer',
    background: '#172033',
    borderBottom: '1px solid #334155',
  },
  chainName: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 16,
    fontWeight: 700,
    color: '#f8fafc',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#38bdf8',
    display: 'inline-block',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  chainIdBadge: {
    fontSize: 12,
    padding: '2px 8px',
    borderRadius: 999,
    background: 'rgba(56,189,248,0.12)',
    color: '#38bdf8',
    border: '1px solid rgba(56,189,248,0.3)',
  },
  toggleIcon: { fontSize: 12, color: '#94a3b8' },
  fieldTable: { width: '100%', borderCollapse: 'collapse' },
  fieldRow: { borderBottom: '1px solid rgba(51,65,85,0.4)' },
  fieldKey: {
    padding: '8px 16px',
    fontSize: 12,
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    width: '40%',
    verticalAlign: 'top',
  },
  fieldValue: {
    padding: '8px 16px',
    fontSize: 13,
    wordBreak: 'break-all',
    verticalAlign: 'top',
  },
  plainValue: { fontVariantNumeric: 'tabular-nums' },
  address: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    cursor: 'pointer',
    borderBottom: '1px dashed transparent',
  },
  emptyValue: { color: '#475569' },
  copiedTag: {
    marginLeft: 8,
    fontSize: 11,
    color: '#4ade80',
  },
  moreHint: {
    padding: '8px 16px',
    fontSize: 12,
    color: '#38bdf8',
    cursor: 'pointer',
    textAlign: 'center',
    borderTop: '1px solid rgba(51,65,85,0.4)',
    background: 'rgba(56,189,248,0.04)',
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