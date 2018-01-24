const NProgress: any = require('nprogress');
import { SUCCESS, FAIL } from './API_CONSTANT';

/**
 *  处理业务状态码
 */

const ajaxStatus = {
  SUCCESS, // 成功
  FAIL, // 失败
};

export interface ErrType {
  default: string;
  [propName: string]: any;
}

export interface ResType {
  code?: string;
  data?: any;
  errors?: ErrType;
  token?: string;
}

export default function (promise): Promise<ResType> {
  NProgress.start();
  return new Promise(function (resolve, reject) {
    promise.then(function (res) {
      NProgress.done();
      const result: ResType = res.body;
      switch (result.code) {
        case ajaxStatus.SUCCESS:
          resolve(result);
          break;
        default:
          reject(result);
          break;
      }
    }).catch(function (err: ErrType) {
      NProgress.done();
      reject(err);
    });
  });
}
