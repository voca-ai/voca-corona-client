import React from 'react';
import {
    Router,
    Switch,
    Route,
    Redirect,
    RouteProps,
} from 'react-router-dom';

import styles from './index.module.scss';
import RecordPage from 'pages/RecordPage';
import RecorderDetailsPage from 'pages/RecorderDetailsPage';
import LoginPage from 'pages/LoginPage';
import { Routes } from 'routes';
import { useAuth0 } from 'react-auth0-spa';
import history from 'utils/history';
import LogoutCallbackPage from 'pages/LogoutCallbackPage';
import LoginCallbackPage from 'pages/LoginCallbackPage';
import HomePage from 'pages/HomePage';
import TermsPage from 'pages/TermsPage';
import Spinner from 'Spinner';
import { useGlobalStore } from 'store';
import EnforceAudioSupport from 'EnforceAudioSupport';

const MustAgreeRoute = ({ component, ...p }: RouteProps) => {
    const globalStore = useGlobalStore();
    const Component = component!;

    return (
        <Route {...p} render={(props) => (
            globalStore.agreeTerms ?
                <Component {...props} /> :
                <Redirect to={Routes.TermsPage} />

        )}/>
    );
};

const WebApp = () => {
    const { loading } = useAuth0();

    if (loading) {
        return (
            <div className={styles.spinnerContainer}>
                <Spinner />
            </div>
        );
    }

    return (
        <div className={styles.webAppContainer}>
            <div id="list"></div>
            <EnforceAudioSupport>
                <Switch>
                    <Route path={Routes.HomePage} component={HomePage} exact />
                    <Route path={Routes.LoginPage} component={LoginPage} />
                    <Route path={Routes.LoginCallbackPage} component={LoginCallbackPage} />
                    <Route path={Routes.LogoutCallbackPage} component={LogoutCallbackPage} />
                    <Route path={Routes.TermsPage} component={TermsPage} />
                    <MustAgreeRoute path={Routes.RecorderDetailsPage} component={RecorderDetailsPage} />
                    <MustAgreeRoute path={Routes.RecordPage} component={RecordPage} />
                    <Route render={() => <Redirect to={Routes.HomePage} />} />
                </Switch>
            </EnforceAudioSupport>
        </div>
    );
}

const App = () => {
    return (
        <Router history={history}>
            <div className={styles.App}>
                <WebApp />
            </div>
        </Router>
    );
}

export default App;
