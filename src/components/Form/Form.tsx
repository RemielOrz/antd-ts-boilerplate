
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'antd';
import FormGroup, { FormGroupData } from './FormGroup';
import FormAction, { ButtonProps } from './FormAction';
import { FormCreateOption, FormComponentProps } from 'antd/lib/form/Form';
import './style.css';

export interface WebFormComponentProps {
  configs: any;
  actionButtons?: ButtonProps[];
  store?: any;
  actions?: any;
  formProps: any;
  formActionProps?: any;
}

const defaultProps = {
  configs: [],
  formProps: {},
  actionButtons: [],
};
const propTypes = {
  configs: PropTypes.array.isRequired,
  actionButtons: PropTypes.array,
  formProps: PropTypes.object,
};

export class WebFormComponent extends React.PureComponent<WebFormComponentProps & FormComponentProps, any> {
  static defaultProps = defaultProps;
  static propTypes = propTypes;
  constructor(props, context) {
    super(props, context);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  /* export names end */
  handleSubmit = (e) => {
    e.preventDefault();
  }
  renderFormGroups() {
    const { configs, form } = this.props;
    return configs.map((item: FormGroupData, index) => {
      return <FormGroup key={index} data={item} form={form} />;
    });
  }
  render() {
    const { actionButtons, form, formProps, formActionProps } = this.props;
    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit} {...formProps}>
        {this.renderFormGroups()}
        <FormAction formActionProps={formActionProps} buttons={actionButtons} form={form}/>
      </Form>
    );
  }
}

const WebForm: any = Form.create<WebFormComponentProps>()(WebFormComponent);

WebForm.create = (options: FormCreateOption<WebFormComponentProps & FormComponentProps>) => {
  return Form.create<WebFormComponentProps>(options)(WebFormComponent);
};
WebForm.WebFormComponent = WebFormComponent;
export default WebForm;
