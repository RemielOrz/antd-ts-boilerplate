import * as React from 'react';
import { getStoreAndActions, createCustomizedList, createCustomizedListTrigger } from '../CreateList';

export interface ApisInterface {
  getList: any;
  getItem?: any;
  create?: any;
  update?: any;
  remove?: any;
}
export interface CreateNormalListOptionsInterface {
  listConfigs: any;
  formConfigs: any;
  formStoreKeys: any;
  apis: ApisInterface;
  Action?: any;
  triggerOptions?: any;
  getApisAdditionalParams?: any;
};
const CreateNormalList = ({
  listConfigs,
  formConfigs,
  formStoreKeys,
  apis,
  Action,
  triggerOptions: newTriggerOptions,
  getApisAdditionalParams,
}: CreateNormalListOptionsInterface) => {
  const triggerOptions = newTriggerOptions || {
    trigger: <a>弹窗按钮</a>,
    title: '标题',
  };
  class NormalList extends React.Component<any, any> {
    List: any = null;
    ReadonlyList: any = null;
    ListTrigger: any = null;
    ReadonlyListTrigger: any = null;
    constructor(props) {
      super(props);
      const storeAndActions = getStoreAndActions({ formStoreKeys, apis });
      const { store } = storeAndActions;
      const actions = Action ? new Action({ ...store, apis }) : storeAndActions.actions;
      const createOptions = {
        getApisAdditionalParams,
        listConfigs,
        formConfigs,
        formStoreKeys,
        apis,
        store,
        actions,
      };
      this.List = createCustomizedList({
        ...createOptions
      });
      this.ReadonlyList = createCustomizedList({
        ...createOptions,
        apis: { getList: apis.getList},
      });
      this.ListTrigger = createCustomizedListTrigger({
        ...createOptions,
        triggerOptions,
      });
      this.ReadonlyListTrigger = createCustomizedListTrigger({
        ...createOptions,
        apis: { getList: apis.getList},
        triggerOptions,
      });
    }
    render() {
      const { isTrigger, isReadonly } = this.props;
      if (isReadonly === true) {
        const List = this.ReadonlyList;
        const ListTrigger = this.ReadonlyListTrigger;
        return isTrigger ? <ListTrigger {...this.props} /> : <List {...this.props} />;
      } else {
        const List = this.List;
        const ListTrigger = this.ListTrigger;
        return isTrigger ? <ListTrigger {...this.props} /> : <List {...this.props} />;
      }
    }
  }
  return NormalList;
};

export default CreateNormalList;
