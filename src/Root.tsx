import React from 'react';

import { Auth0Provider, loginCallbackUri } from './react-auth0-spa';
import config from './auth_config.json';
import history from './utils/history';
import App from 'App';
import { GlobalStoreProvider } from 'store';

// A function that routes the user to the right place
// after login
const onRedirectCallback = (appState: any) => {
  history.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
};


const Root = () => {
	return (
		<Auth0Provider
			domain={config.domain}
			client_id={config.clientId}
			redirect_uri={loginCallbackUri}
			onRedirectCallback={onRedirectCallback}
		>
			<GlobalStoreProvider>
				<App />
			</GlobalStoreProvider>
		</Auth0Provider>
	);
}
export default Root;
