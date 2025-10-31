import React, { useState, useEffect } from 'react';
import chainState from './utils/chain-state'

import { Card, Row, Col, Statistic, List, Typography, Table, Tag } from 'antd';
// import { ExclamationCircleOutlined, BugOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

// 解析 goodMsgs 数据的函数
const parseGoodMsgs = (goodMsgs) => {
  return goodMsgs.map((msg, index) => {
    try {
      // 使用正则表达式提取数据
      const symbolMatch = msg.match(/symbol=(\S+)/);
      const assetMatch = msg.match(/asset=([\d.]+)/);
      const debtMatch = msg.match(/debt=([\d.]+)/);
      
      return {
        key: index,
        symbol: symbolMatch ? symbolMatch[1] : 'N/A',
        asset: assetMatch ? parseFloat(assetMatch[1]) : 0,
        debt: debtMatch ? parseFloat(debtMatch[1]) : 0,
        rawMessage: msg // 保留原始消息用于调试
      };
    } catch (error) {
      console.error('解析消息失败:', msg, error);
      return {
        key: index,
        symbol: '解析错误',
        asset: 0,
        debt: 0,
        rawMessage: msg
      };
    }
  });
};

// 计算资产状态的函数
const getStatus = (asset, debt) => {
  if (asset > debt) return '健康';
  if (asset === debt) return '平衡';
  return '风险';
};

const DataDisplayPage = ({ data }) => {
  const { errCount, errMsgs, excpMsgs, goodMsgs } = data;

  // 解析 goodMsgs 数据
  const goodMsgsData = parseGoodMsgs(goodMsgs);

  // 定义 Table 列
  const goodMsgsColumns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
      render: (symbol) => <Tag color="blue">{symbol}</Tag>,
    },
    {
      title: 'Asset',
      dataIndex: 'asset',
      key: 'asset',
      width: 120,
      render: (asset) => asset.toLocaleString(),
      sorter: (a, b) => a.asset - b.asset,
    },
    {
      title: 'Debt',
      dataIndex: 'debt',
      key: 'debt',
      width: 120,
      render: (debt) => debt.toLocaleString(),
      sorter: (a, b) => a.debt - b.debt,
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const status = getStatus(record.asset, record.debt);
        const color = status === '健康' ? 'green' : status === '平衡' ? 'orange' : 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '净值',
      key: 'netValue',
      width: 120,
      render: (_, record) => {
        const netValue = record.asset - record.debt;
        const color = netValue > 0 ? 'green' : netValue === 0 ? 'orange' : 'red';
        return (
          <span style={{ color: netValue > 0 ? '#3f8600' : netValue === 0 ? '#fa8c16' : '#cf1322' }}>
            {netValue.toLocaleString()}
          </span>
        );
      },
      sorter: (a, b) => (a.asset - a.debt) - (b.asset - b.debt),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>系统消息统计</Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="错误数量"
              value={errCount}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="错误消息数量"
              value={errMsgs.length}
              valueStyle={{ color: '#cf1322' }}
            />
            <List
              size="small"
              dataSource={errMsgs}
              renderItem={(item, index) => (
                <List.Item>
                  <span style={{ color: '#fa8c16' }}>{index + 1}.</span> {item}
                </List.Item>
              )}
              locale={{emptyText: (<span style={{ color: '#18ff90' }}>无错误</span>) }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="异常消息数量"
              value={excpMsgs.length}
              valueStyle={{ color: '#fa8c16' }}
            />
            <List
              size="small"
              dataSource={excpMsgs}
              renderItem={(item, index) => (
                <List.Item>
                  <span style={{ color: '#fa8c16' }}>{index + 1}.</span> {item}
                </List.Item>
              )}
              locale={{ emptyText: (<span style={{ color: '#18ff90' }}>无异常</span>) }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="正常消息数量"
              value={goodMsgs.length}
              valueStyle={{ color: '#3f8600' }}
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Table
                columns={goodMsgsColumns}
                dataSource={goodMsgsData}
                pagination={false}
                style={{ margin: '0 auto' }}
                locale={{ emptyText: (<span style={{ color: '#18ff90' }}>无正常</span>) }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// export default DataDisplayPage;

export default function DebtDisplayPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    errCount: 0,
    errMsgs: [],
    excpMsgs: [],
    goodMsgs: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 调用您的 getDebt 函数
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

  return (
    <DataDisplayPage data={data} />
  )
}
