import * as React from 'react';
import WebForm from '../../components/Form/Form';

const optionsCheckGroup = [
  { label: 'Apple', value: 'Apple' },
  { label: 'Pear', value: 'Pear' },
  { label: 'Orange', value: 'Orange'},
];
const formConfig2 = [{
  title: <h2 style={{textAlign: 'center', margin: 10}}>表单组标题</h2>,
  formData: [{
    type: 'input',
    label: 'input',
    key: 'name',
    fieldProps: {
      placeholder: '请输入文字, 100字节内',
    },
    options: {
      initialValue: '',
      rules: [{
        required: true,
        whitespace: true,
        message: '请输入文字'
      }],
    }
  }, {
    type: 'checkbox',
    label: 'checkbox',
    key: 'checkbox',
  }, {
    type: 'date',
    label: 'date',
    key: 'date',
  }, {
    type: 'checkGroup',
    label: 'check-group',
    key: 'checkGroup',
    fieldProps: {
      options: optionsCheckGroup,
    },
    options: {
      initialValue: [],
    }
  }, {
    type: 'dateRange',
    label: 'date-range',
    key: 'dateRange',
  }]
}];

const actionButtons = [{
  label: '保存',
  onClick: e => {
    console.log(e);
  },
}];
export default class Demo extends React.Component<any, any> {
  render() {
    return (
      <WebForm configs={formConfig2} actionButtons={actionButtons} />
    );
  }
}