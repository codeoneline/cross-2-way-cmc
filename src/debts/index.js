import React, { useState, useEffect } from 'react';
import chainState from '../utils/chain-state'

export default function DebtDisplayPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    errCount: 0,
    errMsgs: [],
    excpMsgs: [],
    goodMsgs: []
  });
  const [error, setError] = useState(null);

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
    <div className="p-6 bg-gray-50 min-h-screen max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">数据概览</h1>
      
      {/* 错误数量统计 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-sm text-gray-500 mb-2">错误数量</div>
        <div className="flex items-center">
          <span className={`text-3xl font-bold ${data.errCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {data.errCount}
          </span>
        </div>
      </div>

      {/* 错误消息 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-red-600 flex items-center">
          错误消息 ({data.errMsgs.length})
        </h2>
        {data.errMsgs.length > 0 ? (
          <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {data.errMsgs.map((msg, index) => (
              <li key={index} className="p-4 hover:bg-gray-50">
                <span className="text-red-600">{index + 1}. {msg}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700">暂无错误消息</p>
          </div>
        )}
      </div>

      {/* 异常消息 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-orange-600 flex items-center">
          异常消息 ({data.excpMsgs.length})
        </h2>
        {data.excpMsgs.length > 0 ? (
          <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {data.excpMsgs.map((msg, index) => (
              <li key={index} className="p-4 hover:bg-gray-50">
                <span className="text-orange-600">{index + 1}. {msg}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700">暂无异常消息</p>
          </div>
        )}
      </div>

      {/* 正常消息 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-green-600 flex items-center">
          正常消息 ({data.goodMsgs.length})
        </h2>
        {data.goodMsgs.length > 0 ? (
          <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {data.goodMsgs.map((msg, index) => (
              <li key={index} className="p-4 hover:bg-gray-50">
                <span className="text-green-600">{index + 1}. {msg}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700">暂无正常消息</p>
          </div>
        )}
      </div>
    </div>
  );
}
