import { Action as BaseAction } from '../../components/CreateList';
import * as objectPath from 'object-path';
/**
 * Actions
 */
export class Action extends BaseAction {
  /**
   * 获取列表前转换参数
   */
  async transformGetListParams(...params): Promise<any>  {
    // console.log('this.columns');
    // console.log(this.columns);
    return params;
  }
  /**
   * 获取列表后转换数据
   */
  async transformGetListData(data) {
    // console.log(data);
    return data;
  }
  /**
   * create前转换参数
   */
  async transformCreateParams(params) {
    let { status } = params;
    if (typeof status === 'string') {
      status = status === '1' ? true : false;
    }
    params.status = status;
    return [params];
  }
  /**
   * 更新前转换参数
   */
  async transformUpdateParams(params) {
    const {
      id, department, email, name, password, roleIds,
    } = params;
    let { departmentId, status } = params;
    if (!departmentId && department) {
      departmentId = +department.id;
    } else {
      departmentId = +departmentId;
    }
    if (typeof status === 'string') {
      status = status === '1' ? true : false;
    }
    return [id, {departmentId, email, name, password, status, roleIds}];
  }
}
