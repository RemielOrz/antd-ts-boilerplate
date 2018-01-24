import * as objectPath from 'object-path';
import { message } from 'antd';
import { action, observable } from 'mobx';
import {
  FormStore,
  ItemStore,
  ItemsStore,
  ListStore,
} from './store';
import { BaseAction as BaseFormAction } from '../../utils/base-action';
import proxy, { ResType } from '../../utils/proxy';
import { SUCCESS, FAIL } from '../../utils/API_CONSTANT';
import { ColumnsStore } from './store';

/**
 * @export
 * @interface Apis
 */
export interface Apis {
  getList?: any;
  getItem?: any;
  create?: any;
  update?: any;
  remove?: any;
}

export interface GetItemParams {
  id: string;
  request?: boolean;
  params?: any;
  apisAdditionalParams?: any;
}

/**
 * Actions
 */
export class Action extends BaseFormAction {

  form: FormStore;
  data: ItemsStore;
  list: ListStore;
  columns: ColumnsStore;

  apis: Apis;

  constructor(props) {
    const { form, data, list, apis, columns } = props;
    super({form, data, list});
    this.apis = apis;
    this.columns = columns;
  }

  /**
   * proxy
   * @param api
   */
  async proxy(api): Promise<ResType>  {
    const res = await proxy(api);
    return res;
  }

  /**
   * isSuccess
   *
   * @param {any} res
   * @returns
   * @memberof Action
   */
  isSuccess(res) {
    return res && res.code === SUCCESS;
  }

  /**
   * catchError
   *
   * @param {any} err
   * @returns
   * @memberof Action
   */
  catchError(err) {
    return objectPath.get(err, 'response.body.errors');
  }

  /**
   * 设置查询参数 pagination, filters
   * 并获取数据
   */
  setQueryAndFetchData({pagination, filters, apisAdditionalParams}) {
    if (pagination.current === undefined) {
      pagination.current = 1;
    }
    /** 直接获取数据, 在getList保存查询参数 */
    this.getList({
      pagination,
      filters,
      apisAdditionalParams,
    });
  }

  @action('设置列表loading状态') setListLoadingStatus(value) {
    if (value) {
      this.list.loading++;
    } else {
      this.list.loading--;
    }
  }

  /**
   * 获取列表前转换参数
   */
  async transformGetListParams(...params): Promise<any>  {
    return params;
  }
  /**
   * 获取列表后转换数据
   */
  async transformGetListData(data, requestParams?, payload?) {
    return data;
  }
  /**
   * 获取列表API
   */
  async getList(payload?) {
    this.setListLoadingStatus(true);
    payload = payload || {};
    const apisAdditionalParams = payload.apisAdditionalParams;
    const pagination = {...this.list.pagination, ...payload.pagination};
    const filters = payload.filters || this.list.filters;
    filters.page = +pagination.current || 1;
    filters.size = +pagination.pageSize || 10;
    let params = [filters];
    if (apisAdditionalParams !== null) {
      params.push(apisAdditionalParams);
    }
    params = await this.transformGetListParams(...params);
    if (!params) {
      return {
        code: FAIL,
      };
    }

    try {
      const res = await this.proxy(this.apis.getList(...params));

      this.setListLoadingStatus(false);

      if (this.isSuccess(res)) {
        let data = await this.transformGetListData(res.data, params, payload);
        /**
         * afterCreate Hook
         * 获取 API 之后可以进行数据处理
         */
        if (this['afterGetListAction']) {
          data = await this['afterGetListAction'](data);
        }
        this.setList(data, pagination, filters);
      }
      return res;
    } catch (err) {
      if (this['handleGetListError']) {
        this['handleGetListError'](err);
      }
      this.setListLoadingStatus(false);
      this.setList({records: []}, pagination, filters);
      return err;
    }
  }
  /**
   * 保存列表
   */
  @action('保存列表') setList(data, pagination, filters) {
    /** 保存pagination */
    pagination.total = +data.total;
    pagination.totalPages = +data.pages;
    this.list.pagination = pagination;
    /** 保存filters */
    this.list.filters = filters;
    /** query.columns */
    if (filters.columns) {
      this.columns.ids = filters.columns;
    }
    /** 保存列表 */
    this.list.ids = data.records.map(item => this.setItem(item));
  }

  /**
   * 保存记录
   */
  @action('保存记录') setItem(item) {
    const id = item.id;
    // 如果列表中没有 ID
    if (!this.data.has(id)) {
      this.data.set(id, new ItemStore(item));
    }else {
      this.data.merge(id, item);
    }
    return id;
  }

  /**
   * 异步取记录前转换参数
   */
  async transformGetItemParams(...params): Promise<any> {
    return params;
  }
  /**
   * 异步获取记录后转换数据
   */
  async transformGetItemData(data, requestParams?, payload?)  {
    return data;
  }
  /**
   * 取记录
   */
  async getItem(getItemParams: GetItemParams) {
    const {id, request, params, apisAdditionalParams} = getItemParams;
    let item: any;
    /** 判断是否需要从服务器取数据 */
    if (!request) {
      /** 直接从列表取数据 */
      item = this.data.get(id);
      /**
       * afterCreate Hook
       * 获取单项 API 之后可以进行数据处理
       */
      if (this['afterGetItemAction']) {
        item = await this['afterGetItemAction'](item);
      }
      return item;
    }else {
      /** 从服务器取数据 */
      let requestParams = [id];
      if (params) {
        requestParams.push(params);
      }
      if (apisAdditionalParams) {
        requestParams.push(apisAdditionalParams);
      }
      requestParams = await this.transformGetItemParams(...requestParams);
      if (!requestParams) {
        return {
          code: FAIL,
        };
      }
      try {
        const res = await this.proxy(this.apis.getItem(...requestParams));
        if (this.isSuccess(res)) {
          let data;
          data = await this.transformGetItemData(res.data, requestParams, getItemParams);
          item = this.data.get(this.setItem(data));
          /**
           * afterCreate Hook
           * 获取单项 API 之后可以进行数据处理
           */
          if (this['afterGetItemAction']) {
            item = await this['afterGetItemAction'](item);
          }
          return item;
        }
      } catch (err) {
        return {};
      }
    }
  }

  /**
   * create前转换参数
   */
  async transformCreateParams(...paramsArray): Promise<any> {
    const params = paramsArray[0];
    return [params];
  }
  /**
   * 添加
   */
  async create(...params) {
    params = await this.transformCreateParams(...params);
    if (!params) {
      return {
        code: FAIL,
      };
    }
    try {
      let res;
      res = await this.proxy(this.apis.create(...params));
      /**
       * afterCreate Hook
       * 创建 API 之后可以进行数据处理
       */
      if (this['afterCreateAction']) {
        res = await this['afterCreateAction'](res);
      }
      // 返回最终结果
      if (res) {
        return res;
      } else {
        // 创建 API 失败
        message.error('创建数据失败');
        return false;
      }
    } catch (err) {
      const errors = this.catchError(err);
      if (errors) {
        this.setFieldErrors(errors);
        return false;
      } else {
        message.error('遇到未知错误，请联系开发人员检查！');
        throw new Error(err);
      }
    }
  }

  /**
   * 更新前转换参数
   */
  async transformUpdateParams(...paramsArray): Promise<any> {
    const params = paramsArray[0];
    const id = params.id;
    if (id) {
      delete params.id;
    }
    return id ? [id, params] : [params];
  }
  /**
   * 更新
   */
  async update(...params) {
    params = await this.transformUpdateParams(...params);
    if (!params) {
      return true;
    }
    try {
      let res: any = await this.proxy(this.apis.update(...params));
      /**
       * afterUpdate Hook
       * 创建 API 之后可以进行数据处理
       */
      if (this['afterUpdateAction']) {
        res = await this['afterUpdateAction'](res);
      }
      return res;
    } catch (err) {
      const errors = this.catchError(err);
      if (errors) {
        this.setFieldErrors(errors);
        return false;
      } else {
        message.error('遇到未知错误，请联系开发人员检查！');
        throw new Error(err);
      }
    }
  }

  /**
   * 删除前转换参数
   */
  async transformRemoveParams(...paramsArray): Promise<any> {
    const params = paramsArray[0];
    const { rowKey } = params;
    return [rowKey];
  }

  /**
   * 删除
   */
  async remove(...params) {
    params = await this.transformRemoveParams(...params);
    if (!params) {
      return {
        code: FAIL,
      };
    }
    try {
      const res: any = await this.proxy(this.apis.remove(...params));
      return res;
    } catch (err) {
      const errors = this.catchError(err);
      if (errors) {
        message.error(JSON.stringify(errors));
        return false;
      } else {
        message.error('遇到未知错误，请联系开发人员检查！');
        throw new Error(err);
      }
    }
  }

  @action('设置 columns')
  setColumns(columns) {
    /** 保存列表 */
    this.columns.ids = columns.map((item => this.setColumnsItem(item)));
  }

  /**
   * 保存记录
   */
  @action('保存 column 记录')
  setColumnsItem(item) {
    const id = item.id;
    // 如果列表中没有 ID
    if (!this.columns.has(id)) {
      this.columns.set(id, new ItemStore(item));
    }else {
      this.columns.merge(id, item);
    }
    return id;
  }

  @action('change column')
  columnsChange(targetKeys, direction, moveKeys) {
    this.columns.ids = targetKeys;
  }

  @action('disableColumns')
  disableColumns() {
    this.columns = undefined;
  }

  @action('setColumnsTargetKeys')
  setColumnsTargetKeys(targetKeys) {
    this.columns.ids = observable.array(targetKeys);
  }
}
