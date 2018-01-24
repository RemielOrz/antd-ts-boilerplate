const apiConstant: any = window['apiConstant'];
// 失败
export const FAIL = apiConstant ? apiConstant.FAIL : '1';
// 成功
export const SUCCESS = apiConstant ? apiConstant.SUCCESS : '0';
// 验证码无效
export const ERROR_INVALID_CAPTCHA = apiConstant ? apiConstant.ERROR_INVALID_CAPTCHA : '101';
// 参数无效
export const ERROR_INVALID_PARAM = apiConstant ? apiConstant.ERROR_INVALID_PARAM : '102';
// 对象已存在
export const ERROR_OBJECT_EXIST = apiConstant ? apiConstant.ERROR_OBJECT_EXIST : '201';
// 对象不存在
export const ERROR_OBJECT_NOT_EXIST = apiConstant ? apiConstant.ERROR_OBJECT_NOT_EXIST : '202';
// 数据已存在
export const ERROR_DB_DATA_EXIST = apiConstant ? apiConstant.ERROR_DB_DATA_EXIST : '203';
// 未授权操作
export const ERROR_AUTH_FAILED = apiConstant ? apiConstant.ERROR_AUTH_FAILED : '301';
// 无权限操作
export const ERROR_PERMISSION_DENIED = apiConstant ? apiConstant.ERROR_PERMISSION_DENIED : '302';
// 返回自定义提示 需前端弹窗提示
export const ERROR_CUSTOM_NOTIFY = apiConstant ? apiConstant.ERROR_CUSTOM_NOTIFY : '1024';
