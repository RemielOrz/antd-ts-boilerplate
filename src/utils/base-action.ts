import { action, toJS } from 'mobx';
import { FormStore, MapStore, ListStore } from './base-store';
import * as objectPath from 'object-path';

/**
 * Actions
 */
export class BaseAction {

  form: FormStore;
  data: MapStore<any>;
  list: ListStore;

  constructor({ form, data, list }) {
    this.form = form;
    this.data = data;
    this.list = list;
  }
  /**
   * 处理表单数据
   */
  @action('处理表单') setForm(data, formKey: string = 'form') {
    const keys = formKey.split('.');
    if (formKey && keys.length > 1) {
      const prev = objectPath.get(this, formKey);
      const jsPrev = toJS(prev);
      const next = (typeof jsPrev === 'object' && Array.isArray(jsPrev) === false)
        ? { ...prev, ...data }
        : data;
      objectPath.set(this, formKey, next);
    } else {
      Object.assign(this[formKey], data);
    }
  }
  /**
   * 处理表单error
   */
  @action('处理表单错误提示') setFieldErrors(errors, formKey: string = 'form') {
    objectPath.set(this, formKey + '.fieldErrors', errors, false);
  }
  /**
   * 处理页码
   */
  @action('处理页码') setPagination(page: number) {
    this.list.pagination.current = page || 1;
  }
}
