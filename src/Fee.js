import React, { useState, useEffect }  from 'react';
// import ReactDOM from 'react-dom';
import chainState from './utils/chain-state'
import BigNumber from "bignumber.js";
import './Fee.css';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';  

const duration = 86400 * 7
const getTime = () => {
  return Math.floor(new Date().getTime() / 1000) - duration
}

const tickFormatter = (value) => {  
  const date = new Date(value);  
  // 这里只显示年和月的缩写，你可以根据需要调整格式  
  return `${date.getMonth() + 1}月${date.getDate()} ${date.getHours()}时${date.getMinutes()}分${date.getSeconds()}`;  
};

// data: order by time ascend
function linearInterpolation(data, targetTime) {
  // Find the data points before and after the target time
  let beforePoint = null;
  let afterPoint = null;

  for (let i = 0; i < data.length; i++) {
      if (data[i].time === targetTime) {
          return BigNumber(data[i].price);
      } else if (data[i].time < targetTime) {
          beforePoint = data[i];
      } else if (data[i].time > targetTime) {
          afterPoint = data[i];
          break;
      }
  }

  // If beforePoint or afterPoint is missing, return null
  if (!beforePoint || !afterPoint) {
      return null;
  }

  // Perform linear interpolation
  const beforeTime = beforePoint.time;
  const afterTime = afterPoint.time;
  const beforePrice = BigNumber(beforePoint.price);
  const afterPrice = BigNumber(afterPoint.price);

  // Calculate the interpolated price
  const interpolatedPrice = beforePrice.plus((afterPrice.minus(beforePrice)).multipliedBy((targetTime - beforeTime) / (afterTime - beforeTime)));

  return interpolatedPrice; // Return the interpolated price with 2 decimal places
}

const getMinMax = (data, fieldName) => {
  const arr = data.filter(i =>( i[fieldName] !== undefined && i[fieldName] !== null))
  if (arr.length === 0) {
    return [
      0,
      0,
    ]
  }
  const arrMin = Math.min(...arr.map(entry => entry[fieldName]));
  const arrMax = Math.max(...arr.map(entry => entry[fieldName]));
  return [
    arrMin, 
    arrMax
  ]
}

const mergeTxsFees = (fees, txs) => {
  const combinedArray = [...fees, ...txs];
  combinedArray.sort((a, b) => {
    return a.time - b.time;
  });
  // 创建一个空数组来存储合并后的结果
  const mergedArray = [];
  // 遍历合并后的数组，将相同时间的对象合并
  let i = 0;
  while (i < combinedArray.length) {
    const currentItem = { ...combinedArray[i] };
    let j = i + 1;
    while (j < combinedArray.length && combinedArray[j].time === currentItem.time) {
      const item = combinedArray[j]
      Object.keys(item).forEach((key) => {
        currentItem[key] = item[key]
      })
      
      j++;
    }

    mergedArray.push(currentItem);
    i = j;
  }

  return mergedArray
}

function Navigation({ data, curTx, onMenuClick }) {
  // const active = (curTx && curTx.srcChainType === sourceCurrency && curTx.destChainType === destinationCurrency) ? 'active' : ''
  return (
    <nav>
      <ul className="navbar">
        {Object.keys(data).map((sourceCurrency, index) => (
          <li key={index} className="navbar-item">
            <span>{sourceCurrency}</span>
            <ul className="submenu">
              {Object.keys(data[sourceCurrency]).map((destinationCurrency, index) => (
                <li key={index}  
                    onClick={() => onMenuClick(data[sourceCurrency][destinationCurrency])} 
                    className={`${(curTx && curTx.srcChainType === sourceCurrency && curTx.destChainType === destinationCurrency) ? 'active' : ''}`} >
                  <span> {destinationCurrency}&nbsp;&nbsp;</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     const data = payload[0].payload
//     return (
//       <div className="custom-tooltip">
//         <p>{`Date: ${label}`}</p>
//         {Object.keys(data).map((entry, index) => (
//           <p color="#22dd22" key={index}>{`${entry}: ${data[entry]}`}</p>
//         ))}
//       </div>
//     );
//   }

//   return null;
// };

function FeeChart({data, curTx, prices, time}) {
  const [isTx, setIsTx] = useState(false);
  const [isContractFee, setIsContractFee] = useState(false);
  const [isSrcPrice, setIsSrcPrice] = useState(false);
  const [isDestPrice, setIsDestPrice] = useState(false);
  const [isSrcPriceMy, setIsSrcPriceMy] = useState(false);
  const [isDestPriceMy, setIsDestPriceMy] = useState(false);

  const [isUsdt, setIsUsdt] = useState(true);

  const [isIncomeUsdt, setIsIncomeUsdt] = useState(true);
  const [isOutcomeUsdt, setIsOutcomeUsdt] = useState(true);
  const [isCostUsdt, setIsCostUsdt] = useState(false);
  const [isPureIncomeUsdt, setIsPureIncomeUsdt] = useState(false);
  
  const handleIsTxChange = (event) => {  
    setIsTx(event.target.checked);  
  };  
  const handleIsContractFeeChange = (event) => {  
    setIsContractFee(event.target.checked);  
  };  
  const handleIsSrcPriceTxChange = (event) => {  
    setIsSrcPrice(event.target.checked);  
  };  
  const handleIsDestPriceChange = (event) => {  
    setIsDestPrice(event.target.checked);  
  };  
  const handleIsSrcPriceMyTxChange = (event) => {  
    setIsSrcPriceMy(event.target.checked);  
  };  
  const handleIsDestPriceMyChange = (event) => {  
    setIsDestPriceMy(event.target.checked);  
  };  

  const handleIsUsdt = (event) => {  
    setIsUsdt(event.target.checked);  
  };  

  const handleIsIncomeUsdtChange = (event) => {  
    setIsIncomeUsdt(event.target.checked);  
  };  
  const handleIsOutcomeUsdtChange = (event) => {  
    setIsOutcomeUsdt(event.target.checked);  
  };  
  const handleIsCostUsdtChange = (event) => {  
    setIsCostUsdt(event.target.checked);  
  };  
  const handleIsPureIncomeUsdtChange = (event) => {  
    setIsPureIncomeUsdt(event.target.checked);  
  };  

  let xAxis = <XAxis />
  let txFeeYAxis = <YAxis />
  let cFeeYAxis = <YAxis />
  let srcPricesYAxis = <YAxis />
  let destPricesYAxis = <YAxis />
  let srcPricesMyYAxis = <YAxis />
  let destPricesMyYAxis = <YAxis />
  let incomeUsdtYAxis = <YAxis />
  let outcomeUsdtYAxis = <YAxis />

  xAxis =  <XAxis dataKey="time" domain={[time, time + duration]} tickFormatter={tickFormatter} orientation="bottom" offset={0}/>

  let [txsFeeMin, txsFeeMax] = getMinMax(data, 'fee')
  txFeeYAxis = <YAxis hide={!isTx} yAxisId="txFee" domain={[txsFeeMin * 0.9, txsFeeMax * 1.1]} stroke="#dddd22" orientation="left" />
  console.log(`txsFeeMin = ${txsFeeMin}, txsFeeMax = ${txsFeeMax}`)

  let [cFeesMin, cFeesMax] = getMinMax(data, 'contractFee')
  cFeeYAxis = <YAxis hide={!isContractFee} yAxisId="contractFee" domain={[cFeesMin * 0.9, cFeesMax * 1.1]} stroke="#22dddd" orientation="right" offset={0} />
  console.log(`cFeesMin = ${cFeesMin}, cFeesMax = ${cFeesMax}`)

  let [srcPriceMin, srcPriceMax] = getMinMax(data, 'srcPrice')
  srcPricesYAxis = <YAxis hide={!isSrcPrice} yAxisId="srcPrice" domain={[srcPriceMin * 0.9, srcPriceMax * 1.1]} stroke="#2222dd" orientation="left" />
  console.log(`srcPriceMin = ${srcPriceMin}, srcPriceMax = ${srcPriceMax}`)

  let [destPriceMin, destPriceMax] = getMinMax(data, 'destPrice')
  destPricesYAxis = <YAxis hide={!isDestPrice} yAxisId="destPrice" domain={[destPriceMin * 0.9, destPriceMax * 1.1]} stroke="#dd22dd" orientation="right"/>
  console.log(`destPriceMin = ${destPriceMin}, destPriceMax = ${destPriceMax}`)


  let [srcPriceMyMin, srcPriceMyMax] = getMinMax(data, 'srcPriceMy')
  srcPricesMyYAxis = <YAxis hide={!isSrcPriceMy} yAxisId="srcPriceMy" domain={[srcPriceMyMin * 0.9, srcPriceMyMax * 1.1]} stroke="#a222dd" orientation="left" />
  console.log(`srcPriceMyMin = ${srcPriceMyMin}, srcPriceMyMax = ${srcPriceMyMax}`)

  let [destPriceMyMin, destPriceMyMax] = getMinMax(data, 'destPriceMy')
  destPricesMyYAxis = <YAxis hide={!isDestPriceMy} yAxisId="destPriceMy" domain={[destPriceMyMin * 0.9, destPriceMyMax * 1.1]} stroke="#dd82dd" orientation="right"/>
  console.log(`destPriceMyMin = ${destPriceMyMin}, destPriceMyMax = ${destPriceMyMax}`)


  let [costUsdtMin, costUsdtMax] = getMinMax(data, isUsdt ? 'costUsdt' : 'cost')
  let [incomeUsdtMin, incomeUsdtMax] = getMinMax(data, isUsdt ? 'incomeUsdt' : 'income')
  let [outcomeUsdtMin, outcomeUsdtMax] = getMinMax(data, isUsdt ? 'outcomeUsdt' : 'outcome')
  let [pureIncomeUsdtMin, pureIncomeUsdtMax] = getMinMax(data, isUsdt ? 'pureIncomeUsdt' : 'pureIncome')
  if (isUsdt) {
    let usdtMin = Math.min(incomeUsdtMin, outcomeUsdtMin, pureIncomeUsdtMin, costUsdtMin)
    let usdtMax = Math.max(incomeUsdtMax, outcomeUsdtMax, pureIncomeUsdtMax, costUsdtMax)
    incomeUsdtYAxis = <YAxis hide={!isIncomeUsdt  && !isOutcomeUsdt && !isPureIncomeUsdt && !isCostUsdt} yAxisId="usdt" domain={[usdtMin * 0.9, usdtMax * 1.1]} stroke="#dd2222" orientation="right"/>
    console.log(`incomeUsdtMin = ${incomeUsdtMin}, incomeUsdtMax = ${incomeUsdtMax}`)
    console.log(`outcomeUsdtMin = ${outcomeUsdtMin}, outcomeUsdtMax = ${outcomeUsdtMax}`)
  } else {
    let usdtMin = Math.min(incomeUsdtMin, pureIncomeUsdtMin, costUsdtMin)
    let usdtMax = Math.max(incomeUsdtMax, pureIncomeUsdtMax, costUsdtMax)
    incomeUsdtYAxis = <YAxis hide={!isIncomeUsdt  && !isPureIncomeUsdt && !isCostUsdt} yAxisId="usdt" domain={[usdtMin * 0.9, usdtMax * 1.1]} stroke="#dd2222" orientation="right"/>
    outcomeUsdtYAxis = <YAxis hide={!isOutcomeUsdt} yAxisId="outcome" domain={[outcomeUsdtMin * 0.9, outcomeUsdtMax * 1.1]} stroke="#dd2222" orientation="left"/>
  }
  console.log(`costUsdtMin = ${costUsdtMin}, costUsdtMax = ${costUsdtMax}`)

  // pureIncomeUsdtYAxis = <YAxis hide={!isPureIncomeUsdt} yAxisId="pureIncomeUsdt" domain={[pureIncomeUsdtMin * 0.9, pureIncomeUsdtMax * 1.1]} stroke="#dd82dd" orientation="right"/>

  /// latest label
  const income = data.filter(item => "income" in item).pop();
  const outcome = data.filter(item => "outcome" in item).pop();

  return (  
    <div>
      <div className="check">
        <input type="checkbox" checked={isTx} onChange={handleIsTxChange}/> tx&nbsp;&nbsp;
        <input type="checkbox" checked={isContractFee} onChange={handleIsContractFeeChange}/> contra&nbsp;&nbsp;
        <input type="checkbox" checked={isSrcPrice} onChange={handleIsSrcPriceTxChange}/> srcPrice&nbsp;&nbsp;
        <input type="checkbox" checked={isDestPrice} onChange={handleIsDestPriceChange}/> destPrice&nbsp;&nbsp;

        <input type="checkbox" checked={isSrcPriceMy} onChange={handleIsSrcPriceMyTxChange}/> srcPriceMy&nbsp;&nbsp;
        <input type="checkbox" checked={isDestPriceMy} onChange={handleIsDestPriceMyChange}/> destPriceMy&nbsp;&nbsp;

        <input type="checkbox" checked={isUsdt} onChange={handleIsUsdt}/> usdt&nbsp;&nbsp;

        <input type="checkbox" checked={isCostUsdt} onChange={handleIsCostUsdtChange}/> 执行消耗&nbsp;&nbsp;
        <input type="checkbox" checked={isPureIncomeUsdt} onChange={handleIsPureIncomeUsdtChange}/> 纯收入&nbsp;&nbsp;

        <input type="checkbox" checked={isIncomeUsdt} onChange={handleIsIncomeUsdtChange}/> 收入&nbsp;&nbsp;
        <input type="checkbox" checked={isOutcomeUsdt} onChange={handleIsOutcomeUsdtChange}/> 支出&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

      </div>
      <div>
        7天总收入: {income ? income.income : '0'}&nbsp; {curTx.srcChainType}&nbsp;最新价格&nbsp;{prices.srcPrice}$&nbsp;&nbsp;&nbsp;&nbsp;
        7天总支出: {outcome ? outcome.outcome : '0'}&nbsp;{curTx.destChainType}&nbsp;最新价格&nbsp;{prices.destPrice}$&nbsp;&nbsp;&nbsp;&nbsp;
      </div>

      <LineChart width={2000} height={800} data={data} margin={{ top: 5, right: 30, left: 200, bottom: 5 }}>  
        {xAxis}
        {txFeeYAxis}
        {cFeeYAxis}
        {srcPricesYAxis}
        {destPricesYAxis}
        {srcPricesMyYAxis}
        {destPricesMyYAxis}
        {incomeUsdtYAxis}
        {outcomeUsdtYAxis}

        <CartesianGrid strokeDasharray="3 3" /> 
        
        <Line hide={!isTx} yAxisId="txFee" type="monotone" dataKey="fee" stroke="#dddd22" connectNulls />  
        <Line hide={!isContractFee} yAxisId="contractFee" type="monotone" dataKey="contractFee" stroke="#22dddd" connectNulls /> 
        <Line hide={!isSrcPrice} yAxisId="srcPrice" type="monotone" dataKey="srcPrice" stroke="#2222dd" connectNulls />  
        <Line hide={!isDestPrice} yAxisId="destPrice" type="monotone" dataKey="destPrice" stroke="#dd22dd" connectNulls />  

        <Line hide={!isSrcPriceMy} yAxisId="srcPriceMy" type="monotone" dataKey="srcPriceMy" stroke="#a222dd" connectNulls />  
        <Line hide={!isDestPriceMy} yAxisId="destPriceMy" type="monotone" dataKey="destPriceMy" stroke="#dd82dd" connectNulls />  

        <Line hide={!isCostUsdt} yAxisId="usdt" type="monotone" dataKey={ isUsdt ? "costUsdt" : "cost" } stroke="#a288dd" connectNulls />  
        <Line hide={!isPureIncomeUsdt} yAxisId="usdt" type="monotone" dataKey={isUsdt ? "pureIncomeUsdt" : "pureIncome"} stroke="#dd82dd" connectNulls />  

        <Line hide={!isIncomeUsdt} yAxisId="usdt" type="monotone" dataKey={ isUsdt ? "incomeUsdt" : "income"} stroke="#dd2222" connectNulls />  
        <Line hide={!isOutcomeUsdt} yAxisId={isUsdt ? "usdt" : "outcome"} type="monotone" dataKey={ isUsdt ? "outcomeUsdt": "outcome" } stroke="#22dd22" connectNulls />  
        {/* <Tooltip content={<CustomTooltip />}/> */}
        <Tooltip />
        <Legend />
      </LineChart>
    </div>
  );  
}

const Fee = () => {
  const [data, setData] = useState([]);
  const [chains, setChains] = useState([]);
  const [feeSrcDest, setFeeSrcDest] = useState({});
  // const [curTx, setCurTx] = useState({ srcChainType: 'ARETH', destChainType: 'BNB', srcChainID: 1073741826, destChainID : 2147484362 })
  const [curTx, setCurTx] = useState({ srcChainType: 'WAN', destChainType: 'BTC', srcChainID: 2153201998, destChainID : 2147483648 })
  const [time, setTime] = useState(0)
  const [firstOldFee, setFirstOldFee] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        /// time
        const time = getTime()
        /// fetch [fees, txs, prices, gasPrices],注意他们只能有一个共同成员time,其余相同名称的字段得改名
        /// chains

        // let chainsArray = (await chainState.getChains(time)).filter((i) => (i.chainCoingeckoID && i.chainDecimals))
        let chainsArray = (await chainState.getChains(time)).filter((i) => (i.coingeckoId && i.decimals))
        let crossAdminChainsArray = await chainState.getCrossAdminChains()

        let chains = {}
        chainsArray.forEach((j) => { 
          chains[j.bip44] = j
          chains[j.bip44].unit = BigNumber(10).pow(j.decimals)
        })
        crossAdminChainsArray.forEach((j) => {
          chains[j].isCrossAdmin = true
        })
        /// nav
        const tmpFeeSrcDest = {}
        /// fee
        const fees = await chainState.getFees(time)
        fees.forEach(fee => {
          fee.srcChainID = parseInt(fee.srcChainID)
          fee.destChainID = parseInt(fee.destChainID)
          if (fee.contractFee) {
            fee.contractFee = BigNumber(fee.contractFee).dividedBy(chains[fee.srcChainID].unit).toNumber()
          }
          if (fee.fee) {
            fee.cost = fee.fee
            delete fee.fee
          }
          
          fee.time = fee.time * 1000
        })
        /// txs
        const txs = (await chainState.getTxs(time)).filter(i => (i.timestamp))
        txs.forEach(i => {
          i.time = i.timestamp * 1000

          const srcChainType = chains[i.srcChainID].chainType
          const destChainType = chains[i.destChainID].chainType

          if (chains[i.srcChainID].isCrossAdmin) {
            // trim navigate
            if (!tmpFeeSrcDest[srcChainType]) {
              tmpFeeSrcDest[srcChainType] = {}
            }
            if (!tmpFeeSrcDest[srcChainType][destChainType]) {
              tmpFeeSrcDest[srcChainType][destChainType] = i
            }
          }

          i.srcChainType = srcChainType
          i.destChainType = destChainType
        })
        /// price
        const prices = await chainState.getPrices(time)
        /// gas price
        const gasPrices = await chainState.getGasPrices(time)

        /// sets
        // set nav
        console.log(JSON.stringify(tmpFeeSrcDest, null, 2))

        // set data
        // const data = merge(fees, txs, prices, gasPrices)
        setTime(time)
        setChains(chains)
        setFeeSrcDest(tmpFeeSrcDest)
        setData({fees, txs, prices, gasPrices});
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const {srcChainID, destChainID} = curTx
    const updateOldFee = async () => {
      if (time !== 0 && Object.keys(chains).length > 0) {
        const oldFee = await chainState.findFirstOldFee(srcChainID, destChainID, time)
        if (oldFee) {
          if (oldFee.contractFee && chains[oldFee.srcChainID] && chains[oldFee.srcChainID].unit) {
            oldFee.contractFee = BigNumber(oldFee.contractFee).dividedBy(chains[oldFee.srcChainID].unit).toNumber()
          }
          setFirstOldFee(oldFee)
        } else {
          setFirstOldFee(null)
        }
      }
    }
    updateOldFee();
  }, [curTx, time, chains])

  const {srcChainType, destChainType, srcChainID, destChainID} = curTx

  let nav = <div/>
  if (feeSrcDest) {
    nav = <Navigation data = { feeSrcDest } curTx = { curTx} onMenuClick = { setCurTx } />
  }

  if (data.prices && data.gasPrices && data.fees && data.txs) {
    console.log('fees, txs, prices, gasPrices has been set')
  
    const srcPrices = data.prices.filter(i => (i.bip44 === srcChainID)).sort((a, b)=>(a.time - b.time))
    const destPrices = data.prices.filter(i => (i.bip44 === destChainID)).sort((a, b)=>(a.time - b.time))
    // const destGasPrices = data.gasPrices.filter(i => (i.bip44 === destChainID))
    console.log(`srcChainID = ${srcChainID}, type = ${typeof srcChainID}`)
    console.log(`destChainID = ${destChainID}, type = ${typeof destChainID}`)
    console.log(`srcChainType = ${srcChainType}, type = ${typeof srcChainType}`)
    console.log(`destChainType = ${destChainType}, type = ${typeof destChainType}`)
    console.log(`data.fees ${JSON.stringify(data.fees)}`)
    const fees = data.fees.filter(i => (i.srcChainID === srcChainID && i.destChainID === destChainID))
    console.log(fees)
    console.log(`data.txs ${JSON.stringify(data.txs)}`)
    const txs = data.txs.filter(i => (i.srcChainID === srcChainID && i.destChainID === destChainID ))
    console.log(txs)
  
    // const feeData = merge(fees, txs, srcPrices, destPrices, destGasPrices, srcChainID, destChainID)
    const feeData = mergeTxsFees(fees, txs, srcChainID, destChainID)
  
    // 计算这些点上的价格
    let income = BigNumber(0)
    let outcome = BigNumber(0)
    let cost = BigNumber(0)
    let pureIncome = BigNumber(0)
    // 如果没有，得获取一下
    // TODO： getContractFeeBefore(time)
    let newContractFee = firstOldFee ? firstOldFee : {contractFee: 0}
    if (!newContractFee) {
      newContractFee = fees.find(i => (i.contractFee))
      if (!newContractFee) {
        newContractFee = BigNumber(0)
      } else {
        newContractFee = BigNumber(newContractFee.contractFee)
      }
    } else {
      newContractFee = BigNumber(newContractFee.contractFee)
    }
    feeData.forEach(i => {
      if (!i.srcPriceMy) {
        const price = linearInterpolation(srcPrices, i.time / 1000)
        if (price) {
          i.srcPriceMy = price.toNumber()
        }
      } 
      if (i.srcPrice) {
        i.srcPrice = BigNumber(i.srcPrice).toNumber()
      } else {
        // i.srcPrice = i.srcPriceMy
      }
      if (!i.destPriceMy) {
        const price = linearInterpolation(destPrices, i.time / 1000)
        if (price) {
          i.destPriceMy = price.toNumber()
        }
      } 
      if (i.destPrice) {
        i.destPrice = BigNumber(i.destPrice).toNumber()
      } else {
        // i.destPrice = i.destPriceMy
      }
      if (!i.srcPrice) {
        console.log(`${srcChainType} srcPrice error: ${i.srcPrice}`)
      }
      if (!i.destPrice) {
        console.log(`${destChainType} destPrice error: ${i.destPrice}`)
      }
    
      // 计算tx的花费与收入
      // srcUsdt
      if (i.fee) {
        outcome = outcome.plus(i.fee)
        i.outcome = outcome.toString()
        i.outcomeUsdt = outcome.multipliedBy(i.destPrice).toString()
  
  
        income = income.plus(newContractFee)
        i.income = income.toString()
        i.incomeUsdt = income.multipliedBy(i.srcPrice).toString()

        pureIncome = pureIncome.plus(newContractFee)
        i.pureIncome = pureIncome.toString()
        i.pureIncomeUsdt = pureIncome.multipliedBy(i.srcPrice).toString()
      }

      if (i.cost) {
        cost = cost.plus(i.cost)
        i.cost = cost.toString()
        if (i.srcPrice) {
          i.costUsdt = cost.multipliedBy(i.srcPrice).toString()
        } else {
        }


        pureIncome = pureIncome.minus(i.cost)
        i.pureIncome = pureIncome.toString()
        if (i.srcPrice) {
          i.pureIncomeUsdt = pureIncome.multipliedBy(i.srcPrice).toString()
        }
      }
      
      if (i.contractFee) {
        newContractFee = i.contractFee
      }
    })
    console.log(feeData)
  
  
    const latestSrcPrice = srcPrices[srcPrices.length - 1]
    const latestDestPrice = destPrices[destPrices.length - 1]
    const chart = <FeeChart data ={ feeData } curTx = { curTx} time = {time} prices = {{srcPrice: latestSrcPrice ? latestSrcPrice.price : 'noDate', destPrice: latestDestPrice ? latestDestPrice.price : 'noDate'}}/>
  
    return (
      <div className='center-container'>
        {nav}
        <div className='center-div'>
          {`${srcChainType} ->  ${destChainType}`}
        </div>
        {chart}
      </div>
    )
  } else {
    return (
      <div className='center-container'>
        {nav}
        <div className='center-div'>
          {`${srcChainType} ->  ${destChainType}`}
        </div>
      </div>
    )
  }
};  

// ReactDOM.render(
//   <React.StrictMode>
//     <SimpleLineChart />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

export default Fee;