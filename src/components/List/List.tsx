/**
 * Created by remiel on 2016/10/8.
 */

import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Table } from 'antd';
import { TableProps, TableRowSelection } from 'antd/lib/table/interface';

const removeArray = function (target, array, rowKey?) {
  let index = -1;
  array.forEach((item, i) => {
    if (typeof rowKey === 'string') {
      if (item[rowKey] === target[rowKey]) {
        index = i;
      }
    }else if (typeof rowKey === 'function') {
      if (rowKey(item) === rowKey(target)) {
        index = i;
      }
    }else {
      if (item === target) {
        index = i;
      }
    }
  });
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
};

export interface ListProps<T> extends TableProps<any> {
  // customized
  rowSelection?: any; // TableRowSelection<T> | boolean;

  selectedRows?: any[];
  selectedRowKeys?: string[];
  /**
   * 全选/取消全选回调
   */
  onSelectAll?: (records: any[]) => any;

  expandedTableRender?: (record: object) => React.ReactNode;
  expandedTableConfig?: (record: object) => TableProps<T>;
  expandedTableRecord?: object;
}

export interface ContextTypes {
  setState: (( state: any) => any);
}
export interface RowSelection {
  selectedRowKeys?: any[];
  onChange?: () => void;
  onSelect?: () => any;
  onSelectAll?: () => any;
}

export default class List<T> extends React.PureComponent<ListProps<any>, any> {
  static propTypes = {
    rowSelection: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    onSelectAll: PropTypes.func,
  };

  static defaultProps = {
    rowSelection: false,
    pagination: false,
    onSelectAll: records => void 0,
  };

  static contextTypes = {
    setState: PropTypes.func,
  };
  context: ContextTypes;
  constructor (props) {
    super(props);
  }
  // 监听选择事件
  onSelectChange = (selectedRowKeys) => {
    this.context.setState({
      selectedRowKeys,
    });
  }

  onRowClick = (record, index: number, e) => {
    const { expandedTableRender, expandedTableConfig, rowSelection, onRowClick } = this.props;
    if (expandedTableRender || expandedTableConfig) {
      this.context.setState({
        expandedTableRecord: record,
      });
    }
    if (rowSelection === true) {
      this.onRowClickSelect(record, index);
    }
    if (onRowClick) {
      onRowClick(record, index, e);
    }
  }

  onRowClickSelect(record, index: number) {
    const { selectedRowKeys, selectedRows, rowKey } = this.props;
    let newSelectedRowKeys;
    let newSelectedRows;
    let key: any = rowKey || index;
    if ( typeof rowKey === 'function') {
      key = rowKey(record, index);
    }

    // 改为点击选择单项，与多选区别开来
    // 如果是选中的且列表中只有一个
    // 则取消选择
    // 否则增加选择
    if (selectedRowKeys && selectedRowKeys.indexOf(key) > -1 && selectedRowKeys.length === 1) {
      newSelectedRowKeys = selectedRowKeys.filter(item => key !== item);
      newSelectedRows = removeArray(record, selectedRows, rowKey);
    } else {
      newSelectedRowKeys = [key];
      newSelectedRows = [record];
    }

    this.context.setState({
      selectedRowKeys: newSelectedRowKeys,
      selectedRows: newSelectedRows,
    });
  }
  onRow = (record, index: number) => {
    const { onRow } = this.props;
    const onRowReturns: any = onRow ? onRow(record, index) : null;
    return {
      onClick: e => this.onRowClick(record, index, e),
      // onDoubleClick: () => {},
      // onContextMenu: () => {},
      // onMouseEnter: () => {},
      // onMouseLeave: () => {},
      ...onRowReturns,
    };
  };

  getRowClassName = (record, index: number) => {
    const { selectedRows, rowClassName, expandedTableRecord } = this.props;
    let rowClassNameString = '';
    if (rowClassName) {
      rowClassNameString = rowClassName(record, index);
    }
    const ani = ['web-list-tr__animated', 'infinite', 'web-list-tr__animate'].join(' ');
    if (expandedTableRecord === record) {
      return ani + ' web-list-tr__highlight ' + rowClassNameString;
    }
    // 如果是选中的且列表中只有一个，应高亮选择区
    // 如要达到上述效果, 需要配合处理expendedTable
    // if (selectedRows &&
    //   selectedRows.length &&
    //   selectedRows.length === 1 &&
    //   selectedRows[0] === record) {
    //   return ani + ' web-list-tr__highlight ' + rowClassNameString;
    // }
    return rowClassNameString;
  }

  // extendedTableRender, expandedTableConfig
  renderExtendedTabel() {
    const {
      expandedTableRender,
      expandedTableConfig,
      expandedTableRecord,
      dataSource,
      rowKey,
      selectedRows,
    } = this.props;
    let record = expandedTableRecord;
    if (dataSource) {
      dataSource.forEach(item => {
        if ( typeof rowKey === 'function' && expandedTableRecord !== null) {
          if (+rowKey(record, 0) === +rowKey(item, 0)) {
            record = item;
          }
        }
      });
    }
    if (!record) {
      return null;
    }
    // expandedTableRender 优先级高于 expandedTableConfig
    if (expandedTableRender &&
      selectedRows &&
      selectedRows.length &&
      selectedRows.length === 1) {
      return expandedTableRender(record);
    }
    if (expandedTableConfig) {
      return (
        <Table
          bordered={true}
          pagination={false}
          {...expandedTableConfig(record)}
        />
      );
    }
    return null;
  }

  getRowSelectionConfigs() {
    const {
      selectedRowKeys,
      selectedRows,
      rowKey,
      onSelectAll,
    } = this.props;
    return {
      selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: (record, selected) => {
        // 如果是选中的，则添加到列表中 否则从列表中去掉
        const oldSelectedRows: any = selectedRows;
        let newSelectedRows = [];
        newSelectedRows = selected
          ? (oldSelectedRows.concat([record]))
          : removeArray(record, oldSelectedRows, rowKey);
        this.context.setState({ selectedRows: newSelectedRows });
      },
      onSelectAll: (selected, allSelectedRows, changeRows) => {
        // 取消全选 ANTD 没有返回取消后的列表 无法进行对比，所以取消全选直接取消所有的选择
        const oldSelectedRows: any = selectedRows;
        let newSelectedRows: any[] = [];
        if (selected) {
          newSelectedRows = (oldSelectedRows.concat(changeRows));
        } else {
          changeRows.map((item) => {
            newSelectedRows = removeArray(item, oldSelectedRows, rowKey);
          });
        }
        this.context.setState({ selectedRows: newSelectedRows });
        /**
         * 回调, 方便外部使用onSelectAll
         */
        if (onSelectAll) {
          onSelectAll(newSelectedRows);
        }
      },
    };
  }

  render () {
    const {
      rowSelection,
    } = this.props;
    let rowSelectionConfigs: any = null;

    if (rowSelection === true) {
      rowSelectionConfigs = this.getRowSelectionConfigs();
    }
    const props: any = this.props;

    return (
      <div>
        <Table
          {...props}
          rowSelection={rowSelectionConfigs}
          rowClassName={this.getRowClassName}
          onRow={this.onRow}
        />
        {this.renderExtendedTabel()}
      </div>
    );
  }
}
