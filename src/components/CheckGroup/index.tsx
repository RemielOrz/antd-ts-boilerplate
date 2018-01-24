import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Checkbox } from 'antd';
const CheckboxGroup = Checkbox.Group;
import './style.css';

export interface CheckboxOptionType {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  /** 默认选中的选项 */
  defaultValue?: string[];
  /** 指定选中的选项 */
  value?: string[];
  /** 指定可选项 */
  options?: CheckboxOptionType[] | string[];
  /** 变化时回调函数 */
  onChange?: (checkedValue: string[]) => void;
  style?: React.CSSProperties;
  disableCheckAll?: boolean;
  checkAllLabel?: string;
}

export interface CheckboxGroupState {
  value: any;
  indeterminate?: boolean;
  checkAll?: boolean;
}
export default class CheckGroup extends React.Component<CheckboxGroupProps, CheckboxGroupState> {
  static defaultProps = {
    options: [],
    disableCheckAll: false,
    checkAllLabel: '全选',
  };
  static propTypes = {
    defaultValue: PropTypes.array,
    value: PropTypes.array,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    disableCheckAll: PropTypes.bool,
    checkAllLabel: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = this.setPropsToState(props);
  }
  componentWillReceiveProps(nextProps) {
    const state = this.setPropsToState(nextProps);
    this.setState(state);
  }
  setPropsToState(props) {
    const value = props.value || props.defaultValue || [];
    const indeterminate = value.length > 0 && value.length < this.props.options.length;
    const checkAll = value.length > 0 && value.length === this.props.options.length;
    return {
      value,
      indeterminate,
      checkAll,
    };
  }
  onChange = (value) => {
    this.setState({
      value,
      indeterminate: !!value.length && (value.length < this.props.options.length),
      checkAll: value.length === this.props.options.length,
    });
    this.toggleOption(value);
  }
  onCheckAllChange = (e) => {
    const value = e.target.checked ? this.getPlainOptions() : [];
    this.setState({
      value,
      indeterminate: false,
      checkAll: e.target.checked,
    });
    this.toggleOption(value);
  }
  toggleOption = (value) => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(value);
    }
  }
  getOptions() {
    const { options } = this.props;
    // https://github.com/Microsoft/TypeScript/issues/7960
    return (options as any[]).map(option => {
      if (typeof option === 'string') {
        return {
          label: option,
          value: option,
        } as CheckboxOptionType;
      }
      return option;
    });
  }
  getPlainOptions() {
    const { options } = this.props;
    return (options as any[]).map((option: any) => {
      if (typeof option === 'string') {
        return option;
      }
      return option.value;
    });
  }
  renderCheckAll() {
    if (this.props.disableCheckAll) {
      return null;
    }
    return (
      <div>
        <Checkbox
          indeterminate={this.state.indeterminate}
          onChange={this.onCheckAllChange}
          checked={this.state.checkAll}
        >
          {this.props.checkAllLabel}
        </Checkbox>
        <div className="hr" />
      </div>
    );
  }
  render() {
    return (
      <div>
        {this.renderCheckAll()}
        <CheckboxGroup
          options={this.props.options}
          value={this.state.value}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
