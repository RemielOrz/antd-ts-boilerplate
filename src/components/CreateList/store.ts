import { extendObservable, observable } from 'mobx';
import * as BaseStore from '../../utils/base-store';

/**
 * 表单属性定义
 */
export class FormStore extends BaseStore.FormStore {
  constructor(item: any) {
    super();
    extendObservable(this, item);
  }
}
/**
 * 属性定义
 */
export class ItemStore {
  @observable id: string;
  constructor(item: any) {
    extendObservable(this, item);
  }
}

/**
 * 列表定义
 */
export class ItemsStore extends BaseStore.MapStore<ItemStore> {}

/**
 * 列表
 */
export class ListStore extends BaseStore.ListStore {}

/**
 * column过滤器
 */
export class ColumnsStore extends BaseStore.MapStore<ItemStore> {
  @observable ids: string[] = [];
}
