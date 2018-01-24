import * as React from 'react';
import { Form, Button } from 'antd';
const FormItem = Form.Item;
import { WrappedFormUtils } from './FormItem';

export interface ButtonProps {
  label: string;
  onClick?: (e: object) => void;
  render?: (form: object, item: ButtonProps, index: number) => React.ReactNode;
  buttonProps?: object;
}
export interface FormActionProps {
  form: WrappedFormUtils;
  buttons?: ButtonProps[];
  formActionProps?: object;
}

export default class FormAction extends React.PureComponent<FormActionProps, any> {
  renderButtons() {
    const { buttons, form } = this.props;
    if (buttons) {
      return buttons.map((item: ButtonProps, index) => {
        const onClick = () => {
          form.validateFieldsAndScroll((errors, values) => {
            if (!!errors) {
              return;
            }
            if (item.onClick) {
              item.onClick(form.getFieldsValue());
            }
          });
        };
        if (item.render) {
          return item.render(form, item, index);
        }
        let buttonProps = {};
        if (item.buttonProps) {
          buttonProps = item.buttonProps;
        }
        return (
          <Button
            className="u-ml-10"
            {...buttonProps}
            key={index}
            type={'primary'}
            onClick={onClick}
            htmlType={'submit'}
          >
            {item.label}
          </Button>
        );
      });
    }
  }
  render() {
    const formItemLayout = {
      wrapperCol: { span: 16, offset: 6 },
    };
    return (
      <FormItem
        className="form-footer"
        {...formItemLayout}
        {...this.props.formActionProps}
      >
        <div>
          {this.renderButtons()}
        </div>
      </FormItem>
    );
  }
}
