import * as React from 'react';
import { toJS } from 'mobx';
import api from './api';
import {
  createCustomizedList,
  getStoreAndActions,
} from '../../components/CreateList';
import {
  Action,
} from './action';
const apis = {
  getList: api,
  create: api,
  update: api,
  remove: api,
};
/**
 * listConfig
 *
 * @param {any} props
 * @returns
 */
function listConfigs(props) {
  const {
    actions,
    store,
  } = props;
  let configs;
  const rowKey = record => record.id;
  const columns = [{
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  }, {
    title: '用户名',
    dataIndex: 'name',
    key: 'name',
  }, {
    title: '所属部门',
    dataIndex: 'department',
    key: 'department',
    render(department) {
      if (!department) {
        return '';
      }
      return <span>{department.name}</span>;
    },
  }, {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
  }, {
    title: '角色',
    dataIndex: 'roleNames',
    key: 'roleNames',
  }, {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render(status) {
      return <span>{status === '1' ? '启用' : '冻结'}</span>;
    },
  }, {
    title: '最后登录时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
  }];

  const tableConfig = {
    columns,
    rowKey,
    rowSelection: true, // 是否出现选择框
    dataSource: [],
    pagination: true,
    expandedTableConfig: r => {
      return {
        columns,
        rowKey,
        dataSource: [r]
      };
    },
  };

  const actionButtons = [
    {
      title: '启用',
      popconfirm: '确定要启用选择的用户吗？',
      useSelectRow(selectedRows) {
        return selectedRows.length === 1;
      },
      onClick(selectedRows) {
        const data = Object.assign({}, toJS(selectedRows)[0]);
        data.status = true;
        actions.update(data);
      },
    }, {
      title: '冻结',
      popconfirm: '确定要冻结选择的用户吗？',
      useSelectRow(selectedRows) {
        return selectedRows.length === 1;
      },
      onClick(selectedRows) {
        const data = Object.assign({}, toJS(selectedRows)[0]);
        data.status = false;
        actions.update(data);
      },
    },
  ];
  const filters = {
    configs: [{
      formData: [{
        type: 'input',
        label: '用户名',
        key: 'username',
      }, {
        type: 'input',
        label: '所属部门',
        key: 'department',
      }, {
        type: 'select',
        label: '角色',
        key: 'roleName',
        fieldProps: {
          options: [{value: '1', label: '1'}],
        },
        options: {
          initialValue: '1',
        },
      }],
    }],
    beforeSearch(e) {
      return e;
    },
  };

  configs = {
    filters,
    columnFilters: columns.map(item => {
      return {
        id: item.key,
        title: item.title,
        description: item.title,
        isDefault: true,
      };
    }),
    table: tableConfig,
    actionButtons,
  };

  return configs;
}

/**
 * formConfigs
 *
 * @param {any} props
 * @returns
 */
function formConfigs(props) {
  const {
    store,
  } = props;
  const baseFormData: any = [{
    type: 'input',
    label: '姓名',
    key: 'name',
    fieldProps: {
      placeholder: '请输入姓名，必填',
    },
    options: {
      initialValue: '',
      rules: [{
        required: true,
        message: '姓名不能为空!',
      }],
    },
  }, {
    type: 'input',
    label: '邮箱',
    key: 'email',
    fieldProps: {
      placeholder: '请输入邮箱，必填',
    },
    options: {
      initialValue: '',
      rules: [{
        required: true,
        message: '邮箱不能为空!',
      }],
    },
  }, {
    type: 'password',
    label: '密码',
    key: 'password',
    fieldProps: {
      placeholder: '请输入密码' + (!(store.id > 0) ? '，必填' : ''),
    },
    options: {
      initialValue: '',
      rules: [{
        required: !(store.id > 0),
        message: '密码不能为空!',
      }],
    },
  }, {
    type: 'radioGroup',
    label: '状态',
    key: 'status',
    fieldProps: {
      options: [{
        label: '冻结',
        value: '0',
      }, {
        label: '启用',
        value: '1',
      }],
    },
    options: {
      initialValue: '0',
    },
  }];
  const formData: any = [].concat(baseFormData);
  const configs = {
    configs: [{
      formData,
    }],
    actionButtons: [],
  };

  return configs;
}

const formStoreKeys = {
  id: '',
  name: '',
  email: '',
  password: '',
  status: '1',
};

const { store } = getStoreAndActions({ formStoreKeys, apis });
const actionsParams = Object.assign({}, store, { apis });
const actions = new Action(actionsParams);

export { store, actions };

const List = createCustomizedList({
  listConfigs,
  formConfigs,
  formStoreKeys,
  apis,
  store,
  actions,
});

export default class extends React.Component<any, any> {
  render() {
    return (
      <List {...this.props} />
    );
  }
}
