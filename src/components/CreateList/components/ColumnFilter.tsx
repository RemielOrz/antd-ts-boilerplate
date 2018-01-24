import * as React from 'react';
import { Transfer, Button } from 'antd';
import createModal from '../../Modal';

class ColumnFilter extends React.PureComponent<any, any> {
  filterOption = (inputValue, option) => {
    return option.title.indexOf(inputValue) > -1;
  }
  handleChange = (targetKeys, direction, moveKeys) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(targetKeys, direction, moveKeys);
    }
  }
  render() {
    const { dataSource, targetKeys } = this.props;
    const listStyle = {
      width: 350,
      height: 600,
    };
    return (
      <Transfer
        listStyle={listStyle}
        titles={['未选', '已选']}
        dataSource={dataSource}
        showSearch={true}
        filterOption={this.filterOption}
        targetKeys={targetKeys}
        onChange={this.handleChange}
        render={item => item.title}
      />
    );
  }
}

const Modal = createModal((props, setModalVisible) => {
  return {
    title: props.title || '列设置',
    trigger: props.trigger || <Button type="primary" className="u-ml-10">列设置</Button>,
    footer: null,
    width: 800,
    onCancel: props.onCancel,
  };
});

export default class ColumnFilterModalTrigger extends React.PureComponent<any, any> {
  render() {
    return (
      <Modal {...this.props}>
        <ColumnFilter {...this.props}/>
      </Modal>
    );
  }
}
