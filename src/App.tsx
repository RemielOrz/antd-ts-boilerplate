import * as React from 'react';
import './App.css';
import LoginDemo from './containers/Login/index';
import FormDemo from 'containers/FormDemo';
import ListDemo from './containers/ListDemo/index';
import CreateListDemo from './containers/CreateListDemo/index';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <CreateListDemo />
      </div>
    );
  }
}

export default App;
