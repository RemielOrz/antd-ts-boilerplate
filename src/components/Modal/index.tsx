import * as React from 'react';
import { Modal } from 'antd';
const isPromise = function (obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};
export type visibleFn = (visible: boolean) => any;

export interface Options {
  confirmLoading?: boolean;
  title?: string | React.ReactElement<any>;
  closable?: boolean;
  onOk?: (context?: any) => void;
  onCancel?: (context?: any) => void;
  width?: string | number;
  footer?: React.ReactType | null;
  okText?: string;
  cancelText?: string;
  maskClosable?: boolean;
  style?: object;
  wrapClassName?: string;
}

export type getOptionsFnType = (props?: any, setModalVisible?: visibleFn) => Options;

type triggerType = React.ReactType | React.ReactElement<{ onClick: () => void; }>;

export interface ChildType {
  ref: any;
  setModalVisible: visibleFn;
}

export default function createModal(getOptions: getOptionsFnType): React.ReactType {
  return class WebModal extends React.Component<any, any> {
    options: any;
    ref: any;
    constructor(props) {
      super(props);
      this.state = {
        visible: false,
      };
      this.options = getOptions(props, this.setModalVisible);
    }

    componentWillUnmount() {
      this.setModalVisible(false);
    }

    componentWillReceiveProps(newProps) {
      this.options = getOptions(newProps, this.setModalVisible);
    }

    setModalVisible = (visible) => {
      this.setState({
        visible,
      });
      if (this.props.change) {
        this.props.change(visible);
      }
    }

    showModal = () => {
      this.setModalVisible(true);
    }

    handleOk = () => {
      if (this.options.onOk) {
        const ok = this.options.onOk(this.ref);
        if (isPromise(ok)) {
          ok.then((isClose) => {
            if (isClose !== false) {
              this.setModalVisible(false);
            }
          });
        } else if (ok !== false) {
          this.setModalVisible(false);
        }
      }
    }

    handleCancel = () => {
      if (this.options.onCancel) {
        this.options.onCancel(this.ref);
      }
      this.setModalVisible(false);
    }

    getRefs = (c) => {
      return this.ref = c;
    }

    renderModal() {
      const { visible } = this.state;
      const modalOptions = {...this.options, ...this.props };
      delete modalOptions.trigger;
      const children = React.Children.map(this.props.children,
        (child: React.ReactElement<ChildType>) =>
          (!React.isValidElement(child) || typeof child.type === 'string')
            ? child
            : React.cloneElement(child, {
                ref: this.getRefs,
                setModalVisible: this.setModalVisible,
              }));

      if (!visible) {
        return null;
      }

      return (
        <Modal
          {...modalOptions}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          {children}
        </Modal>
      );
    }

    onClick = e => {
      const Trigger: any = this.options.trigger;
      if (typeof Trigger.props.onClick === 'function') {
        Trigger.props.onClick(e);
      }
      this.showModal();
    }

    render() {
      const Trigger: triggerType = this.options.trigger;
      const renderTrigger = Trigger && (React.isValidElement(Trigger)
        ? React.cloneElement(Trigger, {onClick: this.onClick})
        : <Trigger showModal={this.showModal} />);

      return renderTrigger && (
        <span className={this.props.className}>
          {renderTrigger}
          {this.renderModal()}
        </span>
      ) || this.renderModal();
    }
  };
}
