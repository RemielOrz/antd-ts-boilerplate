import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Button, Icon } from 'antd';
import WebForm from './Form';
// const styles = require('./style.less');
const MORE_FILTERS_TEXT_OPTIONS = [{
  value: '0',
  label: '更多搜索',
}, {
  value: '1',
  label: '收起搜索',
}];

export interface ContextTypes {
  setState?: ( state: object) => any;
}
export interface SearchFormProps {
  actionButtons?: any[];
  configs: any[];
  onSearch: (e) => void;
}
export interface Group {
  formGroupProps?: any;
  formData: Array<{
    formItemProps: any;
  }>;
}

export default class SearchForm extends React.PureComponent<SearchFormProps, any> {
  static propTypes = {
    onSearch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onSearch(e) {
      return void 0;
    },
  };

  static contextTypes = {
    setState: PropTypes.func,
  };
  context: ContextTypes;
  form;
  webForm;
  private getRefs = {
    webForm: c => {
      this.webForm = c;
    },
  };
  constructor (props) {
    super(props);
    this.state = {
      moreFiltersStatus: '0',
    };
  }
  componentDidMount() {
    this.form = this.webForm;
  }
  setMoreFiltersStatus = (e) => {
    e.preventDefault();
    this.setState({
      moreFiltersStatus: this.state.moreFiltersStatus === '0' ? '1' : '0',
    });
  }
  getActionButtons = () => {
    const { moreFiltersStatus } = this.state;
    let actionButtons: any[] = [];
    const otherBtns: any[] = [];
    let hasSearchBtnKey = false;
    let searchBtn = null;
    let hasResetBtnKey = false;
    let resetBtn = null;
    if (this.props.actionButtons) {
      this.props.actionButtons.forEach(item => {
        switch (item.key) {
          case 'search':
            hasSearchBtnKey = true;
            searchBtn = item;
            break;
          case 'reset':
            hasResetBtnKey = true;
            resetBtn = item;
            break;
          default:
            otherBtns.push(item);
        }
      });
    }
    if (!hasSearchBtnKey) {
      actionButtons.push({
        label: '查询',
        buttonProps: {
          icon: 'search',
        },
        onClick: (e) => {
          this.props.onSearch(e);
        },
      });
    } else {
      actionButtons.push(searchBtn);
    }
    if (!hasResetBtnKey) {
      actionButtons.push({
        label: '重置',
        render(form, record, index) {
          function handleClick(e) {
            form.resetFields();
          }
          return (
            <Button
              className="u-ml-10"
              key={index}
              type="ghost"
              onClick={handleClick}
            >
              {record.label}
            </Button>
          );
        },
      });
    } else {
      actionButtons.push(resetBtn);
    }
    if (this.props.actionButtons) {
      // actionButtons = actionButtons.concat(this.props.actionButtons);
      actionButtons = actionButtons.concat(otherBtns);
    }
    if (this.props.configs.length > 1 || this.props.configs[0].formData.length > 3) {
      actionButtons = actionButtons.concat([{
        label: '',
        render: (form, record, index) => {
          const currentOptions: any = MORE_FILTERS_TEXT_OPTIONS.find(item => item.value === moreFiltersStatus);
          return (
            <a
              className="u-ml-10"
              href="#"
              key={index}
              onClick={this.setMoreFiltersStatus}
            >
              {currentOptions.label}{' '}
              <Icon type={moreFiltersStatus === '1' ? 'up' : 'down'} />
            </a>
          );
        },
      }]);
    }
    return actionButtons;
  }
  getConfigs = () => {
    const { configs } = this.props;
    const { moreFiltersStatus } = this.state;
    const emptyArr: any[] = [];
    const ret = emptyArr.concat(configs);
    ret.forEach((group: Group, i) => {
      const defaultGroupProps: any = {
        className: '',
      };
      if (moreFiltersStatus === '0' && (i > 0)) {
        defaultGroupProps.className = 'search-form-hide-filters';
      }
      group.formGroupProps = {...group.formGroupProps, ...defaultGroupProps};
      group.formData.forEach((item, j) => {
        const defaultProps = {
          labelCol: { span: 8 },
          wrapperCol: { span: 16 },
          style: {
            width: '33.3333%',
          },
          className: '',
        };
        if (moreFiltersStatus === '0' && (i > 0 || j > 2)) {
          defaultProps.className = 'search-form-hide-filters';
        }
        item.formItemProps = {
          ...defaultProps,
          ...item.formItemProps,
          className : defaultProps.className,
        };
      });
    });
    return ret;
  }
  render () {
    const formProps = {
      className: 'search-form',
    };
    const formActionProps = {
      wrapperCol: { span: 24, offset: 0 },
    };
    return (
      <WebForm
        formProps={formProps}
        configs={this.getConfigs()}
        actionButtons={this.getActionButtons()}
        formActionProps={formActionProps}
        ref={this.getRefs.webForm}
      />
    );
  }
}
