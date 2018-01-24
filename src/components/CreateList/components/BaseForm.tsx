import * as React from 'react';
import { observer } from 'mobx-react';
import { message } from 'antd';
import createModal from '../../Modal';
import { StoreForm } from '../../Form';

/**
 * 表单弹窗 Modal 内容
 */
@observer
export class BaseForm extends React.Component<any, any> {
  form;
  webForm;
  configs;
  private getRefs = {
    webForm: c => {
      this.webForm = c;
    },
  };
  componentDidMount() {
    this.form = this.webForm.form;
    if (this.configs.componentDidMount) {
      this.configs.componentDidMount();
    }
  }
  render() {
    const configs = this.configs = this.props.getFormConfigs(this.props);
    return (
      <StoreForm
        {...this.props}
        {...configs}
        ref={this.getRefs.webForm}
      />
    );
  }
}

/**
 * 表单弹窗按钮
 */
const FormModalTrigger = createModal((props, setModalVisible) => {
  const { getApisAdditionalParams } = props;
  let apisAdditionalParams = null;
  if (getApisAdditionalParams) {
    apisAdditionalParams = getApisAdditionalParams(props);
  }

  return {
    title: props.title,
    onOk(context) {
      let ret: any = false;
      const actions = context.props.actions;
      const form = context.form.getForm();
      let cb: any = null;
      form.validateFieldsAndScroll((errors, values) => {
        if (!errors) {
          const data = form.getFieldsValue();
          if (+props.store.id > 0) {
            data.id = props.store.id;
            ret = actions.update(data, apisAdditionalParams);
            cb = props.updateSuccessCb || null;
          } else {
            ret = actions.create(data, apisAdditionalParams);
            cb = props.createSuccessCb || null;
          }
          ret.then((res: any) => {
            if (actions.isSuccess(res)) {
              message.success('操作成功');
              actions.getList({apisAdditionalParams}).then(r => {
                if (cb) {
                  cb(props, res);
                }
              });
              ret = true;
            } else {
              // message.error('输入有误, 请检查表单信息...');
            }
          });
        }
      });
      return ret;
    },
    trigger: props.trigger,
  };
});

/**
 * 表单弹窗按钮
 *
 * @export
 * @class BaseFormModalTrigger
 * @extends {React.PureComponent<any, any>}
 */
export default class BaseFormModalTrigger extends React.PureComponent<any, any> {
  render() {
    const {
      getFormConfigs,
      actions,
      store,
    } = this.props;
    return (
      <FormModalTrigger {...this.props}>
        <BaseForm {...this.props} actions={actions} store={store} getFormConfigs={getFormConfigs}/>
      </FormModalTrigger>
    );
  }
}
