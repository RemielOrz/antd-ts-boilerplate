```ts
import WebForm from './index';
import { Checkbox } from 'antd';
const SearchForm = WebForm.SearchForm;
const LoginForm = WebForm.create({
  onFieldsChange(props, fields) {
    console.log('onFieldsChange', fields)
  },
});
const formConfigs = [{
  formItemProps: {
    wrapperCol: { span: 18 },
  },
  formData: [{
    type: 'input',
    label: '用户名',
    key: 'username',
    fieldProps: {
      placeholder: '请输入用户名',
    },
    options: {
      initialValue: '',
      rules: [{
        required: true,
        whitespace: true,
        message: 'Your name'
      }],
    }
  }, {
    type: 'password',
    label: '密码',
    key: 'password',
  }, {
    type: 'react',
    label: '',
    key: 'remember',
    formItemProps: {
      wrapperCol: { span: 18, offset: 6 },
    },
    render({getFieldDecorator}) {
      return <div>
        <a style={{float: 'right'}} href="/a">忘记密码</a>
        {getFieldDecorator('remember', {valuePropName: 'checked'})(<Checkbox>7天免登录</Checkbox>)}
      </div>;
    }
  }]
}];
const formButtons = [{
  label: 'login',
  onClick(e){
    console.log(e);
  }
}];

const formFilters = {
  configs: [{
    formData: [{
      type: 'input',
      label: 'id',
      key: 'id'
    }, {
      type: 'input',
      label: '产品名称',
      key: 'title',
    }, {
      type: 'input',
      label: '性别',
      key: 'sex',
    }, {
      type: 'input',
      label: '颜色',
      key: 'color',
    }, {
      type: 'textarea',
      label: '搞基不?',
      key: 'isGay',
      options: {
        initialValue: '搞!'
      }
    }]
  }],
  actionButtons: [],
  onSearch(e){alert(JSON.stringify(e))}
};

// form 2

const optionsCheckGroup = [
  { label: 'Apple', value: 'Apple' },
  { label: 'Pear', value: 'Pear' },
  { label: 'Orange', value: 'Orange'},
];
const formConfig2 = [{
  title: '基本信息',
  formData: [{
    type: 'select',
    label: '产品名称类型',
    key: 'type',
    fieldProps: {
      options: optionsCheckGroup
    },
  }, {
    type: 'input',
    label: '产品名称',
    key: 'title',
    fieldProps: {
      placeholder: '请输入产品名称，100字节内',
    },
    options: {
      initialValue: '',
      rules: [{
        required: true,
        whitespace: true,
        message: 'Your good friend\'s name'
      }],
    }
  }, {
    type: 'react',
    label: '产品分类',
    key: 'product_category_id',
    render(form) {
      return <div>产品分类</div>;
    }
  }, {
    type: 'checkGroup',
    label: '产品分类1',
    key: 'CheckGroup',
    fieldProps: {
      options: optionsCheckGroup
    }
  }, {
    type: 'radioGroup',
    label: '产品分类1',
    key: 'radioGroup',
    fieldProps: {
      options: optionsCheckGroup
    }
  }]
}];


```

## WebForm

结构化表单组件,
- 普通表单可以直接用WebForm.
- 双向绑定需要结合WebForm.create(options)来创建组件, 映射store的key, 并把store的数据通关 `store` 传入组件

```render jsx
<WebForm configs={formConfig2} actionButtons={formButtons} />
```
```render jsx
<LoginForm configs={formConfigs} actionButtons={formButtons} />
```
```render jsx
<SearchForm configs={formFilters.configs} onSearch={formFilters.onSearch} actionButtons={[]} />
```

### WebForm

| 参数           | 说明                     | 类型             | 默认值   |
|---------------|--------------------------|-----------------|---------|
| store         | 传入从store取得的数据       | Object          | - |
| actions       | 传入actions               | Object          | - |
| configs       | FormItem的配置            | Object[]        | - |
| actionButtons | 提交按钮或自定义按钮配置     | Object[]        | - |

用于传入

### configs参数分解: `formGroups[]:Object[]`

formGroups

| 参数           | 说明                     | 类型             | 默认值   |
|---------------|--------------------------|-----------------|---------|
| title         | formGroup 标题            | string          | - |
| formItemProps | 统一设置FormItem的props    | Object          | - |
| formData      | FormItem 的数据           | Object[]        | - |

formData

| 参数           | 说明                     | 类型             | 默认值   |
|---------------|--------------------------|-----------------|---------|
| type          | 输入框类型                 | string          | - |
| label         | label 标签的文本           | string          | - |
| formItemProps | 独立设置这个FormItem的props | Object          | - |
| key           | 对应数据的key              | string          | - |
| fieldProps    | 设置这个输入框(组件)的props  | Object          | - |
| options       | 参考[antd Form的getFieldDecorator参数options](https://ant.design/components/form/#getFieldDecorator-参数)  | Object          | - |
| render        | 自定义组件  | Function(form):{}         | - |


### actionButtons参数

表单的操作按钮

| 参数       | 说明                       | 类型            |  默认值  |
|-----------|----------------------------|-----------------|---------|
| label      | button的文本                | String or React.Element | - |
| onClick    | 回调                      | Function(selectedRows: string[]) | - |
| render     | 自定义按钮                 | Function(form):{}  | - |



### WebForm.create(options)

返回一个自定义options的WebForm组件

`options` 的配置项如下。

| 参数      | 说明                                     | 类型       |
|-----------|------------------------------------------|------------|
| onFieldsChange | 当 `Form.Item` 子节点的值发生改变时触发，可以把对应的值转存到 Redux store | Function(props, fields) |
| mapPropsToFields | 把 props 转为对应的值，可用于把 Redux store 中的值读出 | Function(props) |


### WebForm.SearchForm

结构化的查询表单, 一般不单独使用, 已集成到WebList;

| 参数       | 说明                       | 类型            |  默认值  |
|-----------|----------------------------|-----------------|---------|
| configs      | 和普通表单相同             | Array | - |
| actionButtons | 操作按钮                 | Array          | - |
| onSearch | 回调                         | Function(params: Object[]) | - |

### WebForm.StoreForm

对WebForm进一部封装, 需要传入store和actions(必须包含一个setForm方法用于内部处理表单数据), 以及configs; 内部设置了默认的onFieldsChange和mapPropsToFields, 自动出来表单双向绑定和校验错误处理;表单数据结构需要包含一个key `fieldErrors: Object`用于存放错误提示, 以及增加一个 `default` 字段给后端返回错误信息, 返回错误信息无法定位某一字段时会存放在该字段(这个是后端定义的, 有问题可以找 `法兰克` 打人~);

| 参数       | 说明                       | 类型            |  默认值  |
|-----------|----------------------------|-----------------|---------|
| configs   | 和普通表单相同               | Array | - |
| store     | store                      | Object          | - |
| actions   | actions,必须包含一个setForm方法用于内部处理表单数据 | Object | - |
| 其他       | 同WebForm                  | - | - |


未完待续...
