import { useEffect, useMemo, useState } from 'react'

const API_URL = 'http://34.210.149.238:13200/storemanConfigRaw'

// ---------- 工具函数 ----------

function shorten(value, head = 8, tail = 6) {
  if (!value || typeof value !== 'string') return value
  if (value.length <= head + tail + 3) return value
  return `${value.slice(0, head)}...${value.slice(-tail)}`
}

function isZeroHex(value) {
  if (typeof value !== 'string') return false
  if (!value.startsWith('0x')) return false
  return /^0x0*$/.test(value.toLowerCase())
}

// 判断 gpk1 是否已同步
// 规则：空 / undefined / "0x" / 全 0 => 未同步
function isGpk1Synced(gpk1) {
  if (!gpk1) return false
  if (typeof gpk1 !== 'string') return false
  const v = gpk1.trim()
  if (v === '' || v === '0x' || v === '0X') return false
  if (isZeroHex(v)) return false
  return true
}

// 把秒级时间戳格式化为本地时间
function formatTime(ts) {
  if (ts === null || ts === undefined || ts === '') return '—'
  const n = Number(ts)
  if (!isFinite(n) || n === 0) return '—'
  return new Date(n * 1000).toLocaleString()
}

// 从 groupId 尾部提取可读名字，例如 ...746573746e65745f303932 -> testnet_092
function decodeGroupName(groupId) {
  if (typeof groupId !== 'string') return ''
  const hex = groupId.startsWith('0x') ? groupId.slice(2) : groupId
  // 取末尾偶数长度，尝试转 ascii
  const tail = hex.slice(-24).replace(/^0+/, '')
  if (!tail || tail.length % 2 !== 0) return ''
  try {
    let str = ''
    for (let i = 0; i < tail.length; i += 2) {
      const code = parseInt(tail.slice(i, i + 2), 16)
      if (code < 32 || code > 126) return ''
      str += String.fromCharCode(code)
    }
    return str
  } catch {
    return ''
  }
}

function CopyableValue({ value, mono = false, color }) {
  const [copied, setCopied] = useState(false)

  if (value === '' || value === null || value === undefined) {
    return <span style={styles.emptyValue}>—</span>
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(String(value)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    })
  }

  return (
    <span
      title={String(value)}
      onClick={handleCopy}
      style={{
        ...styles.copyable,
        fontFamily: mono
          ? 'ui-monospace, SFMono-Regular, Menlo, monospace'
          : 'inherit',
        color: color || '#e2e8f0',
      }}
    >
      {shorten(String(value))}
      {copied && <span style={styles.copiedTag}>已复制</span>}
    </span>
  )
}

// ---------- Group 卡片 ----------

function GroupCard({ group, chainName }) {
  const synced = isGpk1Synced(group.gpk1)
  const name = decodeGroupName(group.groupId)

  return (
    <div
      style={{
        ...styles.groupCard,
        borderColor: synced ? '#334155' : 'rgba(239,68,68,0.6)',
        background: synced ? '#1e293b' : 'rgba(127,29,29,0.18)',
      }}
    >
      <div style={styles.groupHeader}>
        <div style={styles.groupTitle}>
          {!synced && <span style={styles.alertDot} />}
          <span style={styles.groupIdText} title={group.groupId}>
            {name ? `${name} ` : ''}
            <span style={styles.groupIdDim}>{shorten(group.groupId, 10, 6)}</span>
          </span>
        </div>
        <div style={styles.groupTags}>
          {!synced && <span style={styles.tagRed}>gpk1 未同步</span>}
          {synced && <span style={styles.tagGreen}>gpk1 已同步</span>}
          <span style={styles.tagGray}>status {group.status}</span>
        </div>
      </div>

      <table style={styles.fieldTable}>
        <tbody>
          <Row label="groupId">
            <CopyableValue value={group.groupId} mono />
          </Row>
          <Row label="deposit">
            <span style={styles.plainValue}>{group.deposit}</span>
          </Row>
          <Row label="chain1">
            <span style={styles.plainValue}>{group.chain1}</span>
          </Row>
          <Row label="chain2">
            <span style={styles.plainValue}>{group.chain2}</span>
          </Row>
          <Row label="curve1 / curve2">
            <span style={styles.plainValue}>
              {group.curve1} / {group.curve2}
            </span>
          </Row>

          {/* gpk1 单独高亮 */}
          <tr style={styles.fieldRow}>
            <td style={styles.fieldKey}>gpk1</td>
            <td style={styles.fieldValue}>
              {synced ? (
                <CopyableValue value={group.gpk1} mono />
              ) : (
                <span style={styles.gpkMissing}>
                  {group.gpk1 ? (
                    <CopyableValue
                      value={group.gpk1}
                      mono
                      color="#fca5a5"
                    />
                  ) : (
                    '未同步 (空)'
                  )}
                </span>
              )}
            </td>
          </tr>

          <Row label="gpk2">
            <CopyableValue value={group.gpk2} mono />
          </Row>
          <Row label="startTime">
            <span style={styles.plainValue}>{formatTime(group.startTime)}</span>
          </Row>
          <Row label="endTime">
            <span style={styles.plainValue}>{formatTime(group.endTime)}</span>
          </Row>
          <Row label="lastUpdateTime">
            <span style={styles.plainValue}>
              {formatTime(group.lastUpdateTime)}
            </span>
          </Row>
        </tbody>
      </table>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <tr style={styles.fieldRow}>
      <td style={styles.fieldKey}>{label}</td>
      <td style={styles.fieldValue}>{children}</td>
    </tr>
  )
}

// ---------- 主页面 ----------

export default function StoremanGroupsConfigPage() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const [keyword, setKeyword] = useState('')
  const [onlyUnsynced, setOnlyUnsynced] = useState(false)
  const [chainFilter, setChainFilter] = useState('')

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

  // 按链名 + 过滤条件整理数据
  const chains = useMemo(() => {
    const allChainNames = Object.keys(data)
    const filteredChainNames = chainFilter
      ? allChainNames.filter((c) => c === chainFilter)
      : allChainNames

    const k = keyword.trim().toLowerCase()

    return filteredChainNames.map((chainName) => {
      const groupsObj = data[chainName] || {}
      let groups = Object.values(groupsObj)

      if (onlyUnsynced) {
        groups = groups.filter((g) => !isGpk1Synced(g.gpk1))
      }

      if (k) {
        groups = groups.filter((g) => {
          const name = decodeGroupName(g.groupId)
          return (
            String(g.groupId).toLowerCase().includes(k) ||
            name.toLowerCase().includes(k) ||
            String(g.gpk1).toLowerCase().includes(k) ||
            String(g.gpk2).toLowerCase().includes(k)
          )
        })
      }

      return { chainName, groups }
    })
  }, [data, keyword, onlyUnsynced, chainFilter])

  // 统计
  const stats = useMemo(() => {
    let total = 0
    let unsynced = 0
    Object.values(data).forEach((groupsObj) => {
      Object.values(groupsObj).forEach((g) => {
        total++
        if (!isGpk1Synced(g.gpk1)) unsynced++
      })
    })
    return { total, unsynced }
  }, [data])

  const allChainNames = useMemo(() => Object.keys(data), [data])

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Storeman Groups Config</h1>
            <div style={styles.subtitle}>
              共 {stats.total} 个 group ·
              <span style={{ color: stats.unsynced > 0 ? '#f87171' : '#4ade80' }}>
                {' '}
                gpk1 未同步 {stats.unsynced} 个
              </span>
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
            placeholder="搜索 groupId / 名称 / gpk"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <select
            style={styles.select}
            value={chainFilter}
            onChange={(e) => setChainFilter(e.target.value)}
          >
            <option value="">全部链</option>
            {allChainNames.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={onlyUnsynced}
              onChange={(e) => setOnlyUnsynced(e.target.checked)}
            />
            仅显示 gpk1 未同步
          </label>
        </div>

        {loading && <div style={styles.empty}>加载中…</div>}

        {error && !loading && (
          <div style={styles.error}>
            加载失败：{error}
            <div style={styles.errorHint}>
              若在 HTTPS 页面下访问 HTTP 接口会被浏览器拦截，请使用 Vite 代理。
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          chains.map(({ chainName, groups }) => (
            <section key={chainName} style={styles.chainSection}>
              <div style={styles.chainHeader}>
                <span style={styles.dot} />
                <span style={styles.chainName}>{chainName}</span>
                <span style={styles.chainCount}>
                  {groups.length} 个 group
                </span>
              </div>

              {groups.length === 0 ? (
                <div style={styles.emptySmall}>没有匹配的 group</div>
              ) : (
                <div style={styles.grid}>
                  {groups.map((g) => (
                    <GroupCard key={g.groupId} group={g} chainName={chainName} />
                  ))}
                </div>
              )}
            </section>
          ))}

        {!loading && !error && chains.length === 0 && (
          <div style={styles.empty}>没有匹配的数据</div>
        )}
      </div>
    </div>
  )
}

// ---------- 样式 ----------

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f172a',
    padding: '32px 16px',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    color: '#e2e8f0',
  },
  container: { maxWidth: 1300, margin: '0 auto' },
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
    gap: 12,
    marginBottom: 24,
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
  select: {
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
  chainSection: { marginBottom: 32 },
  chainHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#38bdf8',
    display: 'inline-block',
  },
  chainName: { fontSize: 18, fontWeight: 700, color: '#f8fafc' },
  chainCount: { fontSize: 13, color: '#94a3b8' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
    gap: 16,
  },
  groupCard: {
    borderRadius: 12,
    border: '1px solid #334155',
    overflow: 'hidden',
    transition: 'border-color 0.2s, background 0.2s',
  },
  groupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    padding: '12px 16px',
    background: 'rgba(15,23,42,0.5)',
    borderBottom: '1px solid rgba(51,65,85,0.6)',
  },
  groupTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#f8fafc',
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#ef4444',
    boxShadow: '0 0 0 4px rgba(239,68,68,0.2)',
    display: 'inline-block',
  },
  groupIdText: { wordBreak: 'break-all' },
  groupIdDim: { color: '#94a3b8', fontWeight: 400, fontSize: 12 },
  groupTags: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  tagRed: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 999,
    background: 'rgba(239,68,68,0.15)',
    color: '#fca5a5',
    border: '1px solid rgba(239,68,68,0.4)',
  },
  tagGreen: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 999,
    background: 'rgba(34,197,94,0.15)',
    color: '#4ade80',
    border: '1px solid rgba(34,197,94,0.4)',
  },
  tagGray: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 999,
    background: 'rgba(148,163,184,0.12)',
    color: '#94a3b8',
    border: '1px solid rgba(148,163,184,0.25)',
  },
  fieldTable: { width: '100%', borderCollapse: 'collapse' },
  fieldRow: { borderBottom: '1px solid rgba(51,65,85,0.4)' },
  fieldKey: {
    padding: '7px 16px',
    fontSize: 12,
    color: '#94a3b8',
    width: '34%',
    whiteSpace: 'nowrap',
    verticalAlign: 'top',
  },
  fieldValue: {
    padding: '7px 16px',
    fontSize: 13,
    wordBreak: 'break-all',
    verticalAlign: 'top',
  },
  plainValue: { fontVariantNumeric: 'tabular-nums' },
  copyable: {
    cursor: 'pointer',
    borderBottom: '1px dashed transparent',
  },
  copiedTag: { marginLeft: 8, fontSize: 11, color: '#4ade80' },
  emptyValue: { color: '#475569' },
  gpkMissing: { color: '#fca5a5', fontWeight: 600 },
  empty: { textAlign: 'center', color: '#64748b', padding: 40 },
  emptySmall: { color: '#64748b', padding: 12 },
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