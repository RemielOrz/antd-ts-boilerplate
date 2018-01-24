/**
 * Created by remiel on 2016/10/8.
 */
/**
 * 操作按钮区域渲染
 */
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Popconfirm, Button, Alert } from 'antd';

export interface ActionButtonsProps {
  title?: string;
  mutilTitle?: string;
  popconfirm?: string;
  useSelectRow?: boolean | ((selectedRows: string[] | undefined) => boolean);
  onClick?: (selectedRows: string[] | undefined) => any;
  render?: (params?: any) => any;
  link?: string;
  type?: any;
  loading?: boolean;
}
export interface ActionBoxProps {
  cancelSelect: (e: any) => any;
  buttons: ActionButtonsProps[];
  selectedRows?: string[];
  selectedRowKeys?: string[];
}
export default class ActionBox extends React.PureComponent<ActionBoxProps, any> {
  static propTypes = {
    cancelSelect: PropTypes.func,
    buttons: PropTypes.array,
    selectedRows: PropTypes.array,
    selectedRowKeys: PropTypes.array,
  };
  render () {
    const {
      selectedRowKeys,
      selectedRows,
    } = this.props;
    const btnClasses = 'u-mr-10';
    const actionButtons = this.props.buttons.map((btn: ActionButtonsProps, index) => {
      const { loading } = btn;
      const type = btn.type || 'primary';
      const disabled = !btn.useSelectRow || typeof selectedRowKeys === 'undefined'
        ? false
        : btn.useSelectRow === true
        ? !selectedRowKeys.length
        : !btn.useSelectRow(selectedRows);

      let onClick: any;
      if (btn.onClick) {
        onClick = btn.onClick.bind(null, selectedRows, selectedRowKeys);
      }

      let title = btn.title;
      if (btn.useSelectRow && !disabled && selectedRowKeys && selectedRowKeys.length > 1) {
        title = btn.mutilTitle || ('批量' + title);
      }

      if (btn.render) {
        return React.cloneElement(btn.render(
          {onClick, title, disabled, selectedRows, selectedRowKeys, loading}),
          { key: index },
        );
      }

      if (btn.popconfirm) {
        if (disabled) {
          return (
            <Button key={index} type={type} className={btnClasses} disabled={disabled} loading={loading}>
              {title}
            </Button>
          );
        }
        return (
          <Popconfirm key={index} title={btn.popconfirm} onConfirm={onClick}>
            <Button type={type} className={btnClasses} loading={loading}>
              {title}
            </Button>
          </Popconfirm>
        );
      }

      if (btn.link) {
        return (
          <a key={index} className={btnClasses} href={btn.link}>
            {title}
          </a>
        );
      }

      return (
        <Button
          type={type}
          className={btnClasses}
          disabled={disabled}
          key={index}
          onClick={onClick}
          loading={loading}
        >
          {title}
        </Button>
      );
    });

    const selectedRowKeysInfo = typeof selectedRowKeys === 'undefined'
      ? null
      : !selectedRowKeys.length
      ? (<div>未选择</div>)
      : (
        <div>
          {`选择了 ${selectedRowKeys.length} 个对象 `}
          <a href={'#'} onClick={this.props.cancelSelect} className="u-ml-10">取消选择</a>
        </div>
      );
    const selectedRowKeysNode = selectedRowKeysInfo === null
      ? ''
      : <Alert message={selectedRowKeysInfo} type="info" className="u-mt-10" />;

    return (
      <div className={`row action-box u-mt-20 u-mb-10`}>
        {actionButtons}
        {selectedRowKeysNode}
      </div>
    );
  }
}
