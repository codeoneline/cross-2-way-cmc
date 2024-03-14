import React, { Component } from 'react';
import { Table, Divider } from 'antd';
import './index.css';

class Fields extends Component {

  render() {
    const columns = this.props.columns.map(item => {
      return {
        title: item,
        key: item,
        dataIndex: item,
        render: text => <div style={{"padding": "2px", "background-color": "#434242"}}>{text}</div>
      }
    })

    //wan: {blockNumber:xx}, eth:{blockNumber:xx}  => blockNumber.name, blockNumber.wan, blockNumber.eth
    const data = this.props.data;

    return (
      <div style={{"margin-bottom": "10px", "background-color": "#121335"}}>
        <Divider orientation="left">{this.props.title}</Divider>
        <Table bordered={true} columns={columns} dataSource={data} pagination={false}/>
      </div>
    )
  }
}

export default Fields