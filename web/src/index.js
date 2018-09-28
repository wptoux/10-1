import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from 'react-router-dom'
import Record from './Record';
import Share from './Share';


const Index = () => (
  <Router>
    <div>
      <Route exact path='/' component={App} />
      <Route path='/record' component={Record} />
      <Route path='/share' component={Share} />
    </div>
  </Router>
)

ReactDOM.render(<Index />, document.getElementById('root'));
registerServiceWorker();
