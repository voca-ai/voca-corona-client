// src/react-auth0-spa.js
import React, { useState, useEffect, useContext } from "react";
import createAuth0Client from "@auth0/auth0-spa-js";
import Auth0Client from "@auth0/auth0-spa-js/dist/typings/Auth0Client";
import { Routes } from "routes";

const DEFAULT_REDIRECT_CALLBACK = () =>
	window.history.replaceState({}, document.title, window.location.pathname);

export type ProviderValue = {
	isAuthenticated: boolean,
	user: any,
	loading: boolean,
	popupOpen: boolean,
	loginWithPopup: () => void,
	handleRedirectCallback: () => void,
	auth0Client?: Auth0Client,
	loginWithRedirect: Auth0Client['loginWithRedirect'],
	logout: Auth0Client['logout'],
};

export const loginCallbackUri = `${window.location.origin}${Routes.LoginCallbackPage}`;
export const logoutCallbackUri = `${window.location.origin}${Routes.LogoutCallbackPage}`;

export const Auth0Context = React.createContext<ProviderValue>(undefined as any);
export const useAuth0 = () => useContext(Auth0Context);
export const Auth0Provider = ({
	children,
	onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
	...initOptions
}: any) => {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [user, setUser] = useState<any>();
	const [auth0Client, setAuth0] = useState<Auth0Client>();
	const [loading, setLoading] = useState<boolean>(true);
	const [popupOpen, setPopupOpen] = useState<boolean>(false);

	useEffect(() => {
		const initAuth0 = async () => {
			const auth0FromHook = await createAuth0Client(initOptions);
			setAuth0(auth0FromHook);

			if (window.location.search.includes("code=") &&
				window.location.search.includes("state=")) {
				const { appState } = await auth0FromHook.handleRedirectCallback();
				onRedirectCallback(appState);
			}

			const isAuthenticated = await auth0FromHook.isAuthenticated();

			setIsAuthenticated(isAuthenticated);

			if (isAuthenticated) {
				const user = await auth0FromHook.getUser();
				setUser(user);
			}

			setLoading(false);
		};
		initAuth0();
		// eslint-disable-next-line
	}, []);

	const loginWithPopup = async (params = {}) => {
		setPopupOpen(true);
		try {
			await auth0Client!.loginWithPopup(params);
		} catch (error) {
			console.error(error);
		} finally {
			setPopupOpen(false);
		}
		const user = await auth0Client!.getUser();
		setUser(user);
		setIsAuthenticated(true);
	};

	const handleRedirectCallback = async () => {
		setLoading(true);
		await auth0Client!.handleRedirectCallback();
		const user = await auth0Client!.getUser();
		setLoading(false);
		setIsAuthenticated(true);
		setUser(user);
	};
	return (
		<Auth0Context.Provider
			value={{
				isAuthenticated,
				user,
				loading,
				popupOpen,
				loginWithPopup,
				handleRedirectCallback,
				auth0Client,
				loginWithRedirect: (...p) => auth0Client!.loginWithRedirect({ redirect_uri: loginCallbackUri, ...p }),
				logout: (...p) => auth0Client!.logout({ returnTo: logoutCallbackUri, ...p }),
			}}
		>
			{children}
		</Auth0Context.Provider>
	);
};
