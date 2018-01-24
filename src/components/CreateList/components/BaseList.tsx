import * as React from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { message, Button, Form } from 'antd';
import WebList from '../../List';
import createModal from '../../Modal';
import BaseFormModalTrigger from './BaseForm';
import ColumnFilterModalTrigger from './ColumnFilter';
import * as objectPath from 'object-path';
import * as moment from 'moment';
import * as deepEqual from 'deep-equal';
import * as qs from 'query-string';
const { createFormField } = Form;

import { FormStore, ItemsStore, ListStore, ColumnsStore } from '../store';
import { Action, Apis } from '../action';
/**
 * Action export 出去备用
 */
export { Action };

export interface GetStoreAndActionsParams {
  formStoreKeys?: any;
  apis?: Apis;
}
/**
 * 获取实例化之后的store和actions
 * @export
 * @param {GetStoreAndActionsParams} {formStoreKeys, apis}
 * @returns
 */
export function getStoreAndActions({
  formStoreKeys,
  apis,
}: GetStoreAndActionsParams) {
  const store = {
    form: new FormStore(formStoreKeys),
    data: new ItemsStore(),
    list: new ListStore(),
    columns: new ColumnsStore(),
  };
  const actionsParams = { ...store, apis };
  const actions = new Action(actionsParams);

  return {
    store,
    actions,
  };
}

export function InjectProps(ComponsedComponent, props): React.ReactType {
  @observer
  class C extends React.Component<any, any> {
    render() {
      return <ComponsedComponent {...this.props} {...props} />;
    }
  }
  return C;
}

/**
 * @interface ListConfigs
 */
export interface ListConfigs {
  table: any;
  actionButtons?: any[];
  filters?: any;
  columnFilters?: any[];
  tabs?: any;
  componentDidMount?: any;
  beforeFormTriggerClick?: (
    props: any,
    renderParams: any,
    type: string
  ) => void;
  removeSuccessCb?: (record: any, props: any) => void;
  createSuccessCb?: (record: any, props: any) => void;
  updateSuccessCb?: (record: any, props: any) => void;
}

function transformStringToMoment(value) {
  const reg = /^moment([1-9]\d*)moment$/;
  if (reg.test(value)) {
    return moment(+value.match(reg)[1]);
  }
  return value;
}
function transformParams(data) {
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      data[key] = transformStringToMoment(data[key]);
    }
    if (Array.isArray(data[key])) {
      data[key].forEach((item, i) => {
        if (typeof item === 'string') {
          data[key][i] = transformStringToMoment(item);
        }
      });
    }
  });
  return data;
}

function transformMomentToString(query) {
  const data = { ...query };
  Object.keys(data).forEach(key => {
    if (moment.isMoment(data[key]) === true) {
      data[key] = 'moment' + data[key].valueOf() + 'moment';
    }
    if (Array.isArray(data[key])) {
      const arr: any[] = [];
      let replace: any = false;
      data[key].forEach((item, i) => {
        if (moment.isMoment(item) === true) {
          replace = true;
          arr[i] = 'moment' + item.valueOf() + 'moment';
        }
      });
      if (replace === true) {
        data[key] = arr;
      }
    }
  });
  return data;
}

function formatRouterQuery(query) {
  Object.keys(query).forEach(key => {
    if (query[key] === '' || query[key] === undefined) {
      delete query[key];
    }
  });
  return query;
}

/**
 * 列表
 */
@observer
export class BaseList extends React.Component<any, any> {
  webList;
  searchForm;
  private configs: ListConfigs;
  private getRefs = {
    webList: c => {
      this.webList = c;
    },
  };

  componentDidMount() {
    /** 取得 searchForm 的 form */
    this.searchForm = this.webList.searchForm;

    /* columns */
    if (this.configs.columnFilters !== undefined) {
      const columns = [];
      this.configs.columnFilters.forEach(item => {
        if (item.isDefault === true) {
          columns.push(item);
        }
      });
      this.props.actions.setColumns(columns);
    } else {
      this.props.actions.disableColumns();
    }

    const { location, actions } = this.props;
    const apisAdditionalParams = this.getApisAdditionalParams(this.props);
    if (location) {
      const query = qs.parse(location.search);
      this.setQueryAndFetchData(query || {}, this.props);
    } else {
      apisAdditionalParams
        ? actions.getList({ apisAdditionalParams })
        : actions.getList();
    }

    if (this.configs.componentDidMount) {
      this.configs.componentDidMount();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { store, actions } = nextProps;
    const query = {
      page: store.list.pagination.current,
      size: store.list.pagination.pageSize,
      ...store.list.filters,
    };
    const nextLocation = nextProps.location;
    if (nextLocation) {
      const nextQuery = qs.parse(nextLocation.search) || {};
      if (Object.keys(nextQuery).length !== Object.keys(query).length) {
        // 参数数量不一致 直接去查询
        this.setQueryAndFetchData(nextQuery, nextProps);
      } else {
        let sameQuery = true;
        // 参数数量一致 对比参数值是否改变
        Object.keys(nextQuery).forEach(item => {
          if (nextQuery[item] !== query[item]) {
            // 检测到参数值不一致
            sameQuery = false;
          }
        });
        if (sameQuery !== true) {
          this.setQueryAndFetchData(nextQuery, nextProps);
        }
      }
    } else {
      let shouldUpdate: any = false;
      Object.keys(nextProps).forEach(item => {
        switch (item) {
          case 'actions':
          case 'store':
          case 'formStoreKeys':
          case 'getFormConfigs':
          case 'getListConfigs':
          case 'getApisAdditionalParams':
          case 'setModalVisible':
            break;
          default:
            // 忽略掉值相同、Function 类型、_开始的属性
            if (
              !deepEqual(nextProps[item], this.props[item]) &&
              Object.prototype.toString.call(nextProps[item]) !==
                '[object Function]' &&
              item.indexOf('_') !== 0
            ) {
              shouldUpdate = true;
            }
            break;
        }
      });
      if (shouldUpdate === true) {
        const apisAdditionalParams = this.getApisAdditionalParams(nextProps);
        apisAdditionalParams
          ? actions.getList({ apisAdditionalParams })
          : actions.getList();
      }
    }
  }
  getApisAdditionalParams(props) {
    const { getApisAdditionalParams } = props;
    let apisAdditionalParams = null;
    if (getApisAdditionalParams) {
      apisAdditionalParams = getApisAdditionalParams(props);
    }
    return apisAdditionalParams;
  }
  setQueryAndFetchData(query, props) {
    const { actions, store } = props;
    /** 初始化 searchForm 的值 使用SetFieldsValue */
    this.initFiltersFromLocationBySetFieldsValue(props);
    /** FIXME: 数组变成字符串了 */
    if (typeof query.columns === 'string') {
      query.columns = [query.columns];
    }

    const { page, size, ...filters } = query;
    const pagination = store.list.pagination;
    const apisAdditionalParams = this.getApisAdditionalParams(props);
    pagination.current = page ? +page : 1;
    if (size) {
      pagination.pageSize = +size;
    }
    /** 设置查询参数 获取数据 */
    actions.setQueryAndFetchData({
      pagination,
      filters: transformParams(filters),
      apisAdditionalParams,
    });
  }
  getConfigs() {
    const {
      store,
      actions,
      formStoreKeys,
      getListConfigs,
      getFormConfigs,
    } = this.props;
    this.configs = getListConfigs(this.props, {
      searchForm: this.searchForm,
    });
    /**
     * actionButtons
     */
    const defaultBtns: any[] = [];
    const apis = actions.apis || {};
    const actionButtonsClone = [].concat(this.configs.actionButtons);
    const actionButtons: any[] = [];
    let CreateBtn = null;
    let CreateBtnProps = {};
    let UpdateBtn = null;
    let UpdateBtnProps = {};
    let RemoveBtn = null;
    let RemoveBtnProps = {};

    actionButtonsClone.forEach((item: any, i) => {
      switch (item.key) {
        case 'create':
          if (item.render || item.title) {
            CreateBtn = item;
          } else {
            CreateBtnProps = item;
          }
          break;
        case 'update':
          if (item.render || item.title) {
            UpdateBtn = item;
          } else {
            UpdateBtnProps = item;
          }
          break;
        case 'remove':
          if (item.render || item.title) {
            RemoveBtn = item;
          } else {
            RemoveBtnProps = item;
          }
          break;
        default:
          actionButtons.push(item);
      }
    });
    /** callbacks */
    const { removeSuccessCb } = this.configs;
    /** 根据传入的api 显示 添加/编辑/删除 按钮 */
    const { create, update, remove } = apis;
    if (create) {
      defaultBtns.push({
        render: renderParams => {
          const click = e => {
            if (this.configs.beforeFormTriggerClick) {
              this.configs.beforeFormTriggerClick(
                this.props,
                renderParams,
                'create'
              );
            }
            actions.setForm(formStoreKeys);
            actions.setFieldErrors({});
          };
          const TriggerBtn = (
            <Button
              type="primary"
              className="u-mr-10"
              disabled={renderParams.disabled}
              onClick={click}
            >
              添加
            </Button>
          );
          return (
            <BaseFormModalTrigger
              {...this.props}
              actions={this.props.actions}
              store={this.props.store.form}
              getFormConfigs={getFormConfigs}
              trigger={TriggerBtn}
              title="添加"
            />
          );
        },
        ...CreateBtnProps,
      });
    }
    if (CreateBtn) {
      defaultBtns.push(CreateBtn);
    }
    if (update) {
      defaultBtns.push({
        useSelectRow(selectedRows) {
          return selectedRows.length === 1;
        },
        render: ({ selectedRows, disabled }) => {
          const click = e => {
            if (this.configs.beforeFormTriggerClick) {
              this.configs.beforeFormTriggerClick(
                this.props,
                { selectedRows, disabled },
                'update'
              );
            }
            const apisAdditionalParams = this.getApisAdditionalParams(
              this.props
            );
            actions
              .getItem({
                id: selectedRows[0].id,
                request: actions.apis.getItem,
                apisAdditionalParams,
              })
              .then(data => {
                actions.setForm(data);
              });
            actions.setFieldErrors({});
          };
          return (
            <BaseFormModalTrigger
              {...this.props}
              actions={this.props.actions}
              store={this.props.store.form}
              getFormConfigs={getFormConfigs}
              trigger={
                <Button
                  type="primary"
                  className="u-mr-10"
                  onClick={click}
                  disabled={disabled}
                >
                  编辑
                </Button>
              }
              title="编辑"
            />
          );
        },
        ...UpdateBtnProps,
      });
    }
    if (UpdateBtn) {
      defaultBtns.push(UpdateBtn);
    }
    if (remove) {
      defaultBtns.push({
        title: '删除',
        useSelectRow(selectedRows) {
          return selectedRows.length === 1;
        },
        popconfirm: '确定删除?',
        onClick: selectedRows => {
          const { rowKey } = this.configs.table;
          const apisAdditionalParams = this.getApisAdditionalParams(this.props);
          let id;
          const record = toJS(selectedRows[0]);
          if (typeof rowKey === 'function') {
            id = rowKey(selectedRows[0]);
          }
          actions
            .remove(
              {
                rowKey: id,
                record: toJS(selectedRows[0]),
              },
              apisAdditionalParams
            )
            .then(res => {
              if (actions.isSuccess(res)) {
                message.success('删除成功');
              }
              actions.getList({ apisAdditionalParams });
              if (typeof removeSuccessCb === 'function') {
                removeSuccessCb(record, this.props);
              }
              if (typeof this.props.removeSuccessCb === 'function') {
                this.props.removeSuccessCb(record, this.props);
              }
            });
        },
        ...RemoveBtnProps,
      });
    }
    if (RemoveBtn) {
      defaultBtns.push(RemoveBtn);
    }
    /** 合并传入的按钮 */
    this.configs.actionButtons = actionButtons
      ? defaultBtns.concat(actionButtons)
      : defaultBtns;

    /**
     * filters + tabs
     */
    let filters = this.configs.filters;

    const tabs = this.configs.tabs;
    if (tabs) {
      const tabsFilterKey = tabs.key || 'tabs';
      tabs.key = tabsFilterKey;
      tabs.activeKey =
        objectPath.get(toJS(store), 'list.filters.' + tabsFilterKey) ||
        tabs.activeKey ||
        tabs.defaultactiveKey ||
        '';
      tabs.defaultactiveKey =
        tabs.defaultactiveKey === undefined
          ? tabs.options[0].value
          : tabs.defaultactiveKey;
      tabs.onChange = tabs.onChange || this.handleTabsOnChange;
      if (filters) {
        const formData = objectPath.get(filters, 'configs.0.formData');
        let tabsFilterKeyPushed = false;
        formData.forEach(item => {
          if (item.key === tabsFilterKey) {
            tabsFilterKeyPushed = true;
          }
        });
        if (tabsFilterKeyPushed === false) {
          formData.push({
            type: 'input',
            label: 'tabs',
            key: tabsFilterKey,
            fieldProps: {
              type: 'hidden',
            },
            options: {
              initialValue: tabs.defaultactiveKey,
            },
          });
          objectPath.set(filters, 'configs.0.formData', formData);
        }
      }
    }

    /* columns fliter */
    if (this.configs.columnFilters !== undefined) {
      const columnsFilterKey = 'columns';

      if (filters) {
        const formData = objectPath.get(filters, 'configs.0.formData');
        const formItemLayout = {
          labelCol: { span: 3 },
          wrapperCol: { span: 20 },
        };
        let pushed = false;
        formData.forEach(item => {
          if (item.key === columnsFilterKey) {
            pushed = true;
          }
        });
        if (pushed === false) {
          const source = [];
          const options = [];
          this.configs.columnFilters.forEach(item => {
            source.push(item.id);
            options.push({
              value: item.id,
              label: item.title,
            });
          });
          formData.push({
            type: 'checkGroup',
            label: '列设置',
            key: columnsFilterKey,
            formItemProps: {
              ...formItemLayout,
              style: {
                width: '100%',
                display: 'none',
              },
            },
            fieldProps: {
              // type: 'hidden',
              options,
            },
            options: {
              initialValue: source,
            },
          });
          objectPath.set(filters, 'configs.0.formData', formData);
        }
      }
    }

    if (filters) {
      const { replaceOnSearch } = filters;
      /** onSearch */
      this.configs.filters.onSearch =
        replaceOnSearch || this.handleFilterOnSearch;
      filters = this.setFiltersBtns(filters);
      this.configs.filters = filters;
    }

    return this.configs;
  }
  setFiltersBtns(filters) {
    const actionButtons = filters.actionButtons;
    const searchBtn = this.setFiltersSearchBtn(filters);
    const resetBtn = this.setFiltersResetBtn(filters);
    const btns: any[] = [];
    if (searchBtn) {
      btns.push(searchBtn);
    }
    if (resetBtn) {
      btns.push(resetBtn);
    }
    if (this.configs.columnFilters !== undefined) {
      btns.push(this.setFiltersColumnBtn(filters));
    }
    filters.actionButtons = actionButtons ? btns.concat(actionButtons) : btns;
    return filters;
  }
  setFiltersColumnBtn(filters?) {
    const btn = {
      key: 'column',
      render: () => {
        const { store, actions } = this.props;
        const onChange = (...args) => actions.columnsChange(...args);
        const onCancel = () => {
          const form = this.searchForm.form.getForm();
          form.setFieldsValue({
            columns: toJS(this.props.store.columns.ids),
          });
        };
        const source = [];
        this.configs.columnFilters.forEach(item => {
          item.key = item.id
          item.description = item.description || item.title;
          source.push(item);
        });
        return (
          <ColumnFilterModalTrigger
            dataSource={source}
            targetKeys={toJS(store.columns.ids)}
            onChange={onChange}
            onCancel={onCancel}
            key="column"
          />
        );
      },
    };

    return btn;
  }
  setFiltersSearchBtn(filters?) {
    const { store } = this.props;
    const btn = {
      key: 'search',
      label: '查询',
      buttonProps: {
        icon: 'search',
        loading: store.list.loading > 0,
      },
      onClick: e => {
        this.configs.filters.onSearch(e);
      },
    };

    return btn;
  }
  setFiltersResetBtn(filters?) {
    const { location, history } = this.props;

    if (location) {
      const query: any = {};
      const pathname = location.pathname;

      const btn = {
        key: 'reset',
        render: (form, record, index) => {
          const click = e => {
            const { store } = this.props;
            const pagination = store.list.pagination;
            query.page = 1;
            query.size = pagination.pageSize;
            /** 还原filter 表单配置, 因为初次进入页面设置了url的query参数作为初始值, 重置filters需要还原 */
            // this.resetFilterConfigs(); // 因弃用 initFiltersFromLocation,  不会修改默认的config , 所以不需要resetFilterConfigs
            /** 调用内置重置表单 */
            form.resetFields();
            const fieldsValue = form.getFieldsValue();
            Object.assign(query, fieldsValue);
            /** 开始跳转 */
            history.push({
              pathname,
              search: qs.stringify(
                formatRouterQuery(transformMomentToString(query))
              ),
            });
          };
          return (
            <Button className="u-ml-10" key={index} onClick={click}>
              重置
            </Button>
          );
        },
      };

      return btn;
    }
  }

  initFiltersFromLocationBySetFieldsValue(params?) {
    const location =
      params && params.location ? params.location : this.props.location;
    if (location) {
      let query = qs.parse(location.search);
      query = transformParams(query);
      /** 用form 修改 SearchForm 的 value */
      if (this.searchForm) {
        const form = this.searchForm.form.getForm();
        // form.setFieldsValue(query); // 升级2.8.3后 会报warning, 暂时改用 `setFields`
        const data: any = {};
        this.configs.filters.configs.forEach(group =>
          group.formData.forEach(item => {
            const key = item.key;
            if (query[key] === undefined) {
              data[key] =
                item.options && item.options.initialValue !== undefined
                  ? typeof item.options.initialValue === 'string'
                    ? createFormField({ value: '' })
                    : createFormField({ value: item.options.initialValue })
                  : createFormField(undefined);
            }
          })
        );
        /** FIXME: 数组变成字符串了 */
        if (typeof query.columns === 'string') {
          query.columns = [query.columns];
        }
        Object.keys(query).forEach(key => (data[key] = createFormField({ value: query[key] })));
        /** 去掉form里不存在的key(page, size) 否则 报错 You must wrap field data with `createFormField` */
        const { page, size, ...formData} = data;
        form.setFields(formData);
      }
    }
  }

  handleFilterOnSearch = filters => {
    const { actions, store, location, history } = this.props;
    const apisAdditionalParams = this.getApisAdditionalParams(this.props);
    const { beforeSearch } = this.configs.filters;
    const pagination = store.list.pagination;
    if (beforeSearch) {
      filters = beforeSearch(filters, this.props) || filters;
    }

    // 搜索时重置页码为第一页
    pagination.current = 1;
    if (!location) {
      actions.getList({ filters, apisAdditionalParams, pagination });
    } else {
      const query = { ...filters };
      const pathname = location.pathname;

      query.page = pagination.current;
      query.size = pagination.pageSize;
      const newQuery = formatRouterQuery(transformMomentToString(query));
      if (!deepEqual(newQuery, qs.parse(location.search))) {
        // actions.getList({ filters, apisAdditionalParams, pagination });
        history.push({ pathname, search: qs.stringify(newQuery) });
      }
    }
  };
  handleTabsOnChange = tabkey => {
    const { actions, store, location, history } = this.props;
    const apisAdditionalParams = this.getApisAdditionalParams(this.props);
    const tabsCongigs = this.configs.tabs;
    const tabsFilter = {
      [tabsCongigs.key]: tabkey,
    };
    let filters = store.list.filters;
    filters = { ...filters, ...tabsFilter };
    if (this.configs.filters) {
      const { beforeSearch } = this.configs.filters;
      if (beforeSearch) {
        filters = beforeSearch(filters, this.props) || filters;
      }
    }
    const pagination = {
      ...store.list.pagination,
      current: 1,
    };
    if (!location) {
      actions.getList({ filters, pagination, apisAdditionalParams });
    } else {
      const query = filters;
      const pathname = location.pathname;
      // const pagination = store.list.pagination;
      query.page = pagination.current;
      query.size = pagination.pageSize;
      history.push({
        pathname,
        search: qs.stringify(formatRouterQuery(transformMomentToString(query))),
      });
    }
  };
  handleTableOnChange = (pagination, filters, sorter) => {
    const { actions, location, history } = this.props;
    const apisAdditionalParams = this.getApisAdditionalParams(this.props);
    if (!location) {
      /**
       * 没有传入 location 则分页信息从内存存取
       */
      actions.getList({
        pagination,
        tableFilters: filters,
        sorter,
        apisAdditionalParams,
      });
    } else {
      /**
       * 有location 则从路由(即location)存取相关信息
       */
      const query = qs.parse(location.search) || {};
      const pathname = location.pathname;
      if (pagination.current) {
        query.page = pagination.current;
      }
      if (pagination.pageSize) {
        query.size = pagination.pageSize;
      }
      history.push({
        pathname,
        search: qs.stringify(formatRouterQuery(transformMomentToString(query))),
      });
    }
  };
  render() {
    const configs: any = this.getConfigs();
    const { store } = this.props;
    const table = {...configs.table};

    const data = toJS(store.list.ids).map(item => store.data.get(item));

    table.dataSource = data;
    table.loading = store.list.loading > 0;
    /**
     * pagination, 外部只需传入 true/false, 内部自动获取store的pagination状态, 可在store里定义好相关配置
     */
    if (table.pagination) {
      table.pagination = toJS(store.list.pagination);
    }
    if (!table.onChange) {
      table.onChange = this.handleTableOnChange;
    }
    if (configs.columnFilters !== undefined) {
      const newColumns = [];
      const columns = table.columns;
      toJS(store.columns.ids).forEach(item => {
        const index = columns.findIndex(col => col.key === item);
        newColumns.push(columns[index]);
      });
      table.columns = newColumns;
    }
    return <WebList ref={this.getRefs.webList} {...configs} table={table} />;
  }
}

/**
 * createCustomizedList 参数
 * @interface CreateCustomizedList
 */
export interface CreateCustomizedListInterface {
  getApisAdditionalParams?: (props: any) => any;
  listConfigs: (props: any, other?: any) => ListConfigs;
  formConfigs: (props: any) => any;
  formStoreKeys?: any;
  store?: any;
  actions?: any;
  apis: Apis;
}

export default function createCustomizedList({
  getApisAdditionalParams,
  listConfigs,
  formConfigs,
  formStoreKeys,
  store,
  actions,
  apis,
}: CreateCustomizedListInterface) {
  const defaultProps: any = {};
  if (store) {
    defaultProps.store = store;
  }
  if (actions) {
    defaultProps.actions = actions;
  }
  const props = {
    getApisAdditionalParams,
    getListConfigs: listConfigs,
    getFormConfigs: formConfigs,
    formStoreKeys,
    ...getStoreAndActions({ formStoreKeys, apis }),
    ...defaultProps,
  };
  return InjectProps(BaseList, props);
}

/**
 * createCustomizedListTrigger 参数
 * @interface createCustomizedListTrigger
 */
export interface CreateCustomizedListTrigger
  extends CreateCustomizedListInterface {
  triggerOptions: any;
}

export function createCustomizedListTrigger({
  getApisAdditionalParams,
  listConfigs,
  formConfigs,
  formStoreKeys,
  store,
  actions,
  apis,
  triggerOptions,
}: CreateCustomizedListTrigger) {
  const defaultProps: any = {};
  if (store) {
    defaultProps.store = store;
  }
  if (actions) {
    defaultProps.actions = actions;
  }
  const props = {
    getApisAdditionalParams,
    getListConfigs: listConfigs,
    getFormConfigs: formConfigs,
    formStoreKeys,
    ...getStoreAndActions({ formStoreKeys, apis }),
    ...defaultProps,
  };

  /**
   * 列表弹窗按钮
   */
  const ListModalTrigger = createModal((triggerProps, setModalVisible) => {
    return {
      title: triggerProps.triggerOptions.title,
      onOk(context) {
        if (typeof triggerProps.triggerOptions.onOk === 'function') {
          return triggerProps.triggerOptions.onOk(context);
        }
      },
      trigger: triggerProps.triggerOptions.trigger,
      footer: null,
      width: triggerProps.triggerOptions.width || 600,
    };
  });
  /**
   * 列表弹窗按钮
   *
   * @export
   * @class BaseListModalTrigger
   * @extends {React.PureComponent<any, any>}
   */
  class BaseListModalTrigger extends React.PureComponent<any, any> {
    render() {
      return (
        <ListModalTrigger triggerOptions={triggerOptions} {...this.props}>
          <BaseList {...this.props} />
        </ListModalTrigger>
      );
    }
  }
  return InjectProps(BaseListModalTrigger, props);
}
