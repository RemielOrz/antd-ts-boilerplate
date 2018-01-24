/**
 * @description 基础列表，用于渲染后台常规列表
 *
 */

/**
 * 基础列表
 */
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { SearchForm } from '../Form';
import List, { ListProps } from './List';
import ActionBox, { ActionButtonsProps } from './ActionBox';
import Tabs, { TabsProps } from './Tabs';
export interface WebListProps<T> {
  name?: string;
  className?: string;
  filters?: {
    configs: any[];
    actionButtons?: any[];
    onSearch: (e) => void;
  };
  table: ListProps<T>;
  actionButtons?: ActionButtonsProps[];
  tabs?: TabsProps;
}

export default class WebList extends React.PureComponent<WebListProps<any>, any> {
  static propTypes = {
    filters: PropTypes.object,
    name: PropTypes.string,
    className: PropTypes.string,
    table: PropTypes.object,
    actionButtons: PropTypes.array,
  };
  static defaultProps = {
    name: '',
    className: '',
    // filters: [],
    // actionButtons: []
  };

  static childContextTypes = {
    setState: PropTypes.func,
  };
  /** 取得 searchForm 的 form */
  // searchForm;
  searchForm;
  private getRefs = {
    searchForm: c => {
      this.searchForm = c;
    },
  };

  constructor (props) {
    super(props);
    this.state = {
      ...this.transformPropsToState(props),
      expandedTableRecord: null,
    };
  }

  getChildContext () {
    return {
      setState : this.setStateForChildren,
    };
  }

  componentWillReceiveProps(props) {
    this.setState(this.transformPropsToState(props));
  }

  transformPropsToState(props) {
    const state = this.state;
    let rowSelection: any = null;
    const selectedRowKeys: any[] = [];
    const selectedRows: any[] = [];
    const table = props.table;
    if (table && table.rowSelection === true) {
      if (state && state.selectedRowKeys) {
        table.dataSource.forEach(item => {
          const itemKey = typeof table.rowKey === 'function'
            ? table.rowKey(item)
            : table.rowKey
              ? item[table.rowKey]
              : item['key'];
          if (state.selectedRowKeys.indexOf(itemKey) > -1) {
            selectedRowKeys.push(itemKey);
            selectedRows.push(item);
          }
        });
      }
      rowSelection = {
        selectedRowKeys,
        selectedRows,
      };
      // rowSelection = {
      //   selectedRowKeys: state ? state.selectedRowKeys || [] : [],
      //   selectedRows: state ? state.selectedRows || [] : []
      // };
    }
    return {...state, ...props, ...rowSelection};
  }

  setStateForChildren = (state) => {
    this.setState(state);
  }

  // 取消选择
  cancelSelect = (e) => {
    e.preventDefault();
    this.setState({
      selectedRowKeys: [],
    });
    this.setState({
      selectedRows: [],
    });
  }

  // 重置 expandedTableRecord
  resetExpandedTableRecord = () => {
    this.setState({
      expandedTableRecord: null,
    });
  }

  renderSearch() {
    const { filters } = this.props;
    let onSearch;
    if (filters) {
      if (filters.onSearch) {
        onSearch = (e) => {
          filters.onSearch(e);
          this.resetExpandedTableRecord();
        };
      } else {
        onSearch = () => {
          this.resetExpandedTableRecord();
        };
      }
      return <SearchForm ref={this.getRefs.searchForm} {...filters} onSearch={onSearch} />;
    }
    return null;
  }

  // 操作按钮
  renderActionBtn() {
    const { table, actionButtons } = this.state;
    if (actionButtons) {
      return table && table.rowSelection === true
        ? (
          <ActionBox
            cancelSelect={this.cancelSelect}
            selectedRows={this.state.selectedRows}
            selectedRowKeys={this.state.selectedRowKeys}
            buttons={actionButtons}
          />
        )
        : (
          <ActionBox
            cancelSelect={this.cancelSelect}
            buttons={actionButtons}
          />
        );
    }
    return null;
  }

  // Tabs
  renderTabs() {
    const { tabs } = this.state;
    let onChange;
    if (tabs) {
      if (tabs.onChange) {
        onChange = (...e) => {
          this.resetExpandedTableRecord();
          tabs.onChange(...e);
        };
      } else {
        onChange = () => {
          this.resetExpandedTableRecord();
        };
      }
      return <Tabs {...tabs} onChange={onChange} />;
    }
    return null;
  }

  // 列表
  renderTable() {
    const { table } = this.state;
    let onChange;
    if (table) {
      if (table.onChange) {
        onChange = (...e) => {
          this.resetExpandedTableRecord();
          table.onChange(...e);
        };
      } else {
        onChange = () => {
          this.resetExpandedTableRecord();
        };
      }
      return (
        <List
          {...table}
          selectedRowKeys={this.state.selectedRowKeys}
          selectedRows={this.state.selectedRows}
          expandedTableRecord={this.state.expandedTableRecord}
          onChange={onChange}
        />
      );
    }
    return null;
  }

  render () {
    return (
      <div className="web-list">
        {this.renderSearch()}
        {this.renderTabs()}
        {this.renderActionBtn()}
        {this.renderTable()}
      </div>
    );
  }
}
