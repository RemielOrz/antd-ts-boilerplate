import { observable, action, ObservableMap } from 'mobx';

/**
 * 通用列表定义
 */
export class MapStore<T> {
  data: ObservableMap<T> = observable.shallowMap<T>();
  @action get(id: string) {
    return this.data.get(id);
  }
  @action set(id: string, value: T) {
    return this.data.set(id, value);
  }
  @action has(id: string) {
    return this.data.has(id);
  }
  @action merge(id: string, value: T) {
    // tslint:disable-next-line:prefer-object-spread
    const data = Object.assign({}, this.data.get(id) || {}, value);
    this.data.set(id, data);
  }
  @action remove(id: string) {
    return this.data.delete(id);
  }
  @action values(): T[] {
    return this.data.values();
  }
  @action clear() {
    return this.data.clear();
  }
}

/**
 * 分页
 */
export class PaginationStore {
  current: number = 1;
  pageSize: number = 10;
  total: number = 0;
  /** showSizeChanger , showQuickJumper */
  showSizeChanger: boolean = true;
  showQuickJumper: boolean = true;
  /** totalPages 非 antd 使用 */
  totalPages: number = 0;
}

/**
 * 表单
 */
export class FormStore {
  /**
   * default, fieldErrors 用于校验错误提示
   */
  @observable default?: string = '';
  @observable fieldErrors?: any = {};
}

/**
 * 列表
 */
export class ListStore {
  @observable ids: string[] = [];
  pagination: PaginationStore = new PaginationStore();
  filters: any = {};
  @observable loading: number = 0;
}
