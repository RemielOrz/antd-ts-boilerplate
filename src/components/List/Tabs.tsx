import * as React from 'react';
import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;

export interface TabsProps {
  options?: Array<{
    label: string;
    value: string;
  }>;
  onChange?: (key: string) => any;
  defaultActiveKey?: string;
  activeKey?: string;
}

/**
 * Tabs
 */
export default class extends React.PureComponent<TabsProps, any> {

  renderTabContent(options) {
    return options.map( item => <TabPane tab={item.label} key={item.value} />);
  }
  render() {
    let { onChange, options } = this.props;
    const { activeKey, defaultActiveKey } = this.props;
    if ( !onChange ) {
      onChange = e => void 0;
    }
    options = options || [];

    const tabsProps: any = {
      defaultActiveKey: defaultActiveKey || options[0].value,
    };
    if (activeKey !== undefined) {
      tabsProps.activeKey = activeKey;
    }
    return (
      <Tabs {...tabsProps} onChange={onChange}>
        {this.renderTabContent(options)}
      </Tabs>
    );
  }
}
