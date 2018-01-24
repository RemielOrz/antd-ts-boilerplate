import * as React from 'react';
import * as ReactDOM from 'react-dom';
import WebList from '../index';
require('antd/dist/antd.css');

  const rowKey = record => record.key;

  const dataSource = [{
    key: '1',
    name: '胡彦斌',
    age: 32,
    address: '西湖区湖底公园1号'
  }, {
    key: '2',
    name: '胡彦祖',
    age: 42,
    address: '西湖区湖底公园1号'
  }];

  const pagination = {
    current: 1,
    total: 100,
    pageSize: 10
  };

  const columns = [{
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  }, {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  }, {
    title: '住址',
    dataIndex: 'address',
    key: 'address',
  }];

  const tableConfig = {
    columns,
    rowKey,
    rowSelection: true, // 是否出现选择框
    dataSource,
    pagination,
    expandedTableConfig: record => {
      return {
        columns,
        rowKey,
        dataSource: [record]
      };
    },
  };

  const actionButtons = [
    {
      title: '下架',
      popconfirm: '确定要下架选择的商品吗？',
      useSelectRow: true,
      onClick (selectedRows) {
        alert('下架了');
      }
    }, {
      title: '上架',
      popconfirm: '确定要上架选择的商品吗？',
      useSelectRow: true,
      onClick (selectedRows) {
        alert('上架');
      }
    }
  ];

const formFilters = {
  configs: [{
    formData: [{
      type: 'input',
      label: 'id',
      key: 'id'
    }, {
      type: 'input',
      label: '产品名称',
      key: 'title',
    }, {
      type: 'select',
      label: '性别',
      key: 'sex',
      options: {
        initialValue: '2'
      },
      fieldProps: {
        options: [{
          label: '男',
          value: '1'
        }, {
          label: '妹纸',
          value: '2'
        }]
      }
    }, {
      type: 'input',
      label: '颜色',
      key: 'color',
    }, {
      type: 'textarea',
      label: '名称',
      key: 'name',
      options: {
        initialValue: 'ABC'
      }
    }]
  }],
  actionButtons: [],
  onSearch(e){alert(JSON.stringify(e))},
};

const tabs = {
    options: [
      {
        label: 'tab 1',
        value: '0'
      }, {
        label: 'tab 2',
        value: '1'
      }, {
        label: 'tab 3',
        value: '2'
      }
    ],
    onChange: activeKey => {
      alert(activeKey);
    }
  }
ReactDOM.render(
  <WebList table={tableConfig} actionButtons={actionButtons} filters={formFilters} tabs={tabs} />,
  document.getElementById('example')
);
