import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import Root from './Root';
import * as serviceWorker from './serviceWorker';

import 'bootstrap/dist/css/bootstrap.min.css';

// Redirect to https if using http
if (
    window.location.hostname !== 'localhost' &&
    window.location.protocol !== 'https:'
) {
    window.location.replace(`https:${window.location.href.substring(window.location.protocol.length)}`);
}

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
