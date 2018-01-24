import * as React from 'react';
import * as PropTypes from 'prop-types';
import FormItem, { FormDataProps, WrappedFormUtils } from './FormItem';
// const styles = require('./style.less');

export interface FormGroupData {
  title?: string;
  /** 提供统一设置FormItem的props */
  formGroupProps?: object;
  formItemProps?: object;
  formData: FormDataProps[];
}

export interface FormGroupProps {
  form: WrappedFormUtils;
  data: FormGroupData;
}

const defaultProps = {
  data: {},
};
const propTypes = {
  data: PropTypes.object,
};

export default class FormGroup extends React.PureComponent<FormGroupProps, any> {
  static defaultProps = defaultProps;
  static propTypes = propTypes;
  renderTitle(data) {
    if (typeof data.title === 'string') {
      return <h3>{data.title}</h3>;
    }
    if (React.isValidElement(data.title)) {
      return data.title;
    }
  }
  renderFormItems(formItems: FormDataProps[], data) {
    const { form } = this.props;
    return formItems.map((item, index) => {
      return <FormItem key={item.key} data={item} form={form} formItemProps={data.formItemProps} />;
    });
  }
  render() {
    const { data } = this.props;
    const formItems = data.formData || [];
    const formGroupProps: any = data.formGroupProps || {};
    let formGroupClass = 'form-group';
    if (formGroupProps.className) {
      formGroupClass += ' ' + formGroupProps.className;
    }
    return (
      <div {...formGroupProps} className={formGroupClass}>
        {this.renderTitle(data)}
        <div className={'form-group-items'}>
          {this.renderFormItems(formItems, data)}
        </div>
      </div>
    );
  }
}
