import * as React from 'react';
import * as PropTypes from 'prop-types';

import {
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  DatePicker,
  Switch,
} from 'antd';
const { TextArea } = Input;
const { RangePicker } = DatePicker;
import CheckGroup from '../CheckGroup';
import { Checkbox } from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;
// import Uploader from '@sipin/erp-uploader';
import { WrappedFormUtils } from 'antd/lib/form/Form';
export { WrappedFormUtils };

export interface FormDataProps {
  type?: string;
  label?: string;
  key: string;
  id?: string;
  /** FormItem的props */
  formItemProps: any;
  /** Input等的props */
  fieldProps: any;
  /** getFieldDecorator options */
  options?: any;
  render?: (text: any, record: object, index: number) => React.ReactNode;
}

export interface FormItemProps {
  formItemProps?: any;
  form: WrappedFormUtils;
  data: FormDataProps;
}
const defaultProps = {
  data: {},
};
const propTypes = {
  data: PropTypes.object,
};

class TextView extends React.PureComponent<any, any> {
  static propTypes = {
    defaultValue: PropTypes.any,
    value: PropTypes.any,
    onChange: PropTypes.func,
  };
  render() {
    const { value, defaultValue } = this.props;
    return <div {...this.props}>{value || defaultValue}</div>;
  }
}

export default class WebFormItem extends React.PureComponent<FormItemProps, any> {
  static propTypes = propTypes;
  static defaultProps = defaultProps;

  constructor(props, context) {
    super(props, context);
  }

  renderReact(configs) {
    const { data, form, component } = configs;
    const { key, fieldProps, extraProps } = data;
    const { getFieldDecorator } = form;
    const props = {...fieldProps};

    // 清除多余的 props
    (extraProps || []).map(prop => {
      delete props[prop];
    });

    const C = data.render && data.render(form) || component || null;
    let options = data.options;
    if (typeof options === 'function') {
      options = options(form);
    }
    return C
      ? getFieldDecorator(key, options)(React.cloneElement(C, props))
      : null;
  }

  renderText({ data }) {
    const props = data.fieldProps || {};
    return <p className="ant-form-text" {...props} >{data.defaultValue}</p>;
  }

  renderTextView({ data, form }) {
    return this.renderReact({
      data,
      form,
      component: <TextView />,
    });
  }

  renderInput({ data, form }, inputType) {
    return this.renderReact({
      data,
      form,
      component: <Input type={inputType} />,
    });
  }

  renderTextare({ data, form }) {
    return this.renderReact({
      data,
      form,
      component: <TextArea />,
    });
  }

  renderNumberInput({ data, form }) {
    return this.renderReact({
      data,
      form,
      component: <InputNumber />,
    });
  }

  renderSelect({ data, form }) {
    const { fieldProps } = data;

    if (!fieldProps) {
      throw new Error('Select miss fieldProps.');
    }

    const { options, placeholder, mode } = fieldProps;
    const children = (options || []).map((item, i) => {
      return (
        <Option
          key={`${data.key}-${i}-${item.val}-${data.label}`}
          value={item.value}
          disabled={item.disabled || false}
        >
          {item.label}
        </Option>
      );
    });

    if (mode !== 'multiple') {
      children.unshift(
        (
          <Option key={`${data.key}--1`} value={''} >
            {placeholder || '请选择'}
          </Option>
        ),
      );
    }

    // 多余的 props
    data.extraProps = ['placeholder', 'options'];

    return this.renderReact({
      data,
      form,
      component: (
        <Select placeholder={placeholder}>
          {children}
        </Select>
      ),
    });
  }

  renderRadioGroup({ data, form }) {
    const { fieldProps } = data;

    if (!fieldProps) {
      throw new Error('RadioGroup miss fieldProps.');
    }

    const { type, options } = fieldProps;
    let C: any = Radio;
    if (type === 'button') {
      C = RadioButton;
    }
    const children = (options || []).map((item, i) => {
      return (
        <C
          key={`${data.key}-${i}-${item.val}-${data.label}`}
          disabled={item.disabled || false}
          value={item.value}
        >
          {item.label}
        </C>
      );
    });

    // 多余的 props
    data.extraProps = ['type', 'options'];

    return this.renderReact({
      data,
      form,
      component: (
        <RadioGroup>
          {children}
        </RadioGroup>
      ),
    });
  }

  renderCheckbox({ data, form }) {
    return this.renderReact({
      data,
      form,
      component: <Checkbox />,
    });
  }

  renderCheckGroup({ data, form }) {
    return this.renderReact({
      data,
      form,
      component: <CheckGroup options={[]}/>,
    });
  }

  renderDate({ data, form }) {
    return this.renderReact({
      data,
      form,
      component: <DatePicker />,
    });
  }

  renderDateRange({ data, form }) {
    return this.renderReact({
      data,
      form,
      component: <RangePicker />,
    });
  }

  renderBoolean({ data, form }) {
    data.valuePropName = 'checked';
    return this.renderReact({
      data,
      form,
      component: <Switch />,
    });
  }

  renderUploader({ data, form }) {
    return this.renderReact({
      data,
      form,
      component: <div />,
    });
  }

  renderFormItem(data, form) {
    switch (data.type) {
      case 'react':
        return this.renderReact({ data, form });
      case 'text':
        return this.renderText({ data });
      case 'view':
        return this.renderTextView({ data, form });
      case 'input':
        return this.renderInput({ data, form }, 'text');
      case 'number':
        return this.renderNumberInput({ data, form });
      case 'password':
        return this.renderInput({ data, form }, 'password');
      case 'select':
        return this.renderSelect({ data, form });
      case 'radioGroup':
        return this.renderRadioGroup({ data, form });
      case 'checkbox':
        return this.renderCheckbox({ data, form });
      case 'checkGroup':
        return this.renderCheckGroup({ data, form });
      case 'upload':
        return this.renderUploader({ data, form });
      case 'textarea':
        return this.renderTextare({ data, form });
      case 'date':
        return this.renderDate({ data, form });
      case 'dateRange':
        return this.renderDateRange({ data, form });
      case 'boolean':
        return this.renderBoolean({ data, form });
      default:
        return null;
    }
  }

  render() {
    const { data, formItemProps, form } = this.props;
    const { isFieldValidating, getFieldError } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const thisFormItemProps = data.formItemProps || {};
    // 隐藏域直接返回隐藏 input 框
    if (data.type === 'input' && data.fieldProps && data.fieldProps.type === 'hidden') {
      return this.renderFormItem(data, form);
    }
    return (
      <FormItem
        {...formItemLayout}
        {...formItemProps}
        label={data.label}
        help={isFieldValidating(data.key) ? '校验中...' : (getFieldError(data.key) || []).join(', ')}
        {...thisFormItemProps}
      >
        {this.renderFormItem(data, form)}
      </FormItem>
    );
  }
}
