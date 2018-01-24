import * as React from 'react';
import * as PropTypes from 'prop-types';
import WebForm from './Form';
import { observer, inject, Provider } from 'mobx-react';
import { toJS } from 'mobx';
import { Form } from 'antd';
const { createFormField } = Form;

export function mapPropsToFields(props) {
  const formData: any = {};
  const store = toJS(props.store);
  const errors = store.fieldErrors;
  Object.keys(store).forEach(item => {
    formData[item] = createFormField({value: store[item]});
    if (errors && errors[item]) {
      formData[item] = createFormField({
        value: store[item],
        errors: [{
          field: item,
          message: errors[item],
        }],
      });
    }
  });
  return formData;
}
export function onFieldsChange(props, fields) {
  const actions = props.actions || {};
  const formData = {};
  const fieldErrors = toJS(props.store.fieldErrors) || {};
  Object.keys(fields).forEach(item => {
    formData[item] = fields[item].value;
    fieldErrors[item] = fields[item].errors && fields[item].errors.length
      ? fields[item].errors[0].message
      : undefined;
  });
  if (Object.keys(fieldErrors).length) {
    actions.setFieldErrors(fieldErrors);
  }
  actions.setForm(formData);
}

export interface ContextTypes {
  getChildForm: ( form: object) => void;
}

@inject('store')
@observer
export class InjectForm extends React.Component<any, any> {
  static contextTypes = {
    getChildForm: PropTypes.func,
  };
  context: ContextTypes;
  webForm;
  private getRefs = {
    webForm: c => {
      this.webForm = c;
    },
  };
  private Form;
  private configs;

  componentWillMount() {
    const options = {
      onFieldsChange,
      mapPropsToFields,
      ...this.props.options,
    };
    // 生成Form
    this.Form = WebForm.create(options);
    // getConfigs
    this.getConfigs(this.props);
  }
  componentDidMount() {
    this.context.getChildForm(this.webForm);
  }
  componentWillReceiveProps(props) {
    // getConfigs
    this.getConfigs(props);
  }
  getConfigs(props) {
    // configs 增加统一的错误提示字段
    this.configs = [].concat(props.configs);
    this.configs.unshift({
      formData: [{
        type: 'react',
        key: 'default',
        formItemProps: {
          wrapperCol: { span: 16, offset: 6 },
          className: 'has-error',
        },
        render() {
          return '';
        },
      }],
    });

  }
  render() {
    const {
      store,
    } = this.props;
    // 使双向绑定生效, 解决mobx不显示调用的字段不检测的问题
    Object.keys(toJS(store)).forEach( () => void 0);
    return (
      <this.Form ref={this.getRefs.webForm} {...this.props} configs={this.configs} />
    );
  }
}

class StoreForm extends React.PureComponent<any, any> {

  static childContextTypes = {
    getChildForm: PropTypes.func,
  };
  form;
  webForm;
  private getRefs = {
    webForm: c => {
      this.webForm = c;
    },
  };

  getChildContext () {
    return {
      getChildForm : this.getChildForm,
    };
  }
  getChildForm = (form) => {
    this.form = form;
  }

  render() {
    const {
      store,
      ...newProps,
    } = this.props;
    return (
      <Provider store={store} >
        <InjectForm ref={this.getRefs.webForm} {...newProps} />
      </Provider>
    );
  }
}
export default StoreForm;
