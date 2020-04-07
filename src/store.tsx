import React from 'react';
import { useLocalStore } from 'mobx-react';
import { observable, computed } from 'mobx';


export const agreeTermsKey = 'agreeTerms';
class GlobalStore {
	@observable formSubmissionId: string | null = null;
	@observable private _agreeTerms: boolean = localStorage.getItem(agreeTermsKey) === 'true';

	@computed get agreeTerms() {
		return this._agreeTerms;
	}

	set agreeTerms(value: boolean) {
		this._agreeTerms = value;
		localStorage.setItem(agreeTermsKey, JSON.stringify(value));
	}
}

export const createGlobalStore = () => new GlobalStore();

const storeContext = React.createContext<GlobalStore | null>(null);

export const GlobalStoreProvider = ({ children }: any) => {
	const store = useLocalStore(createGlobalStore);
	return <storeContext.Provider value={store}>{children}</storeContext.Provider>;
}

export const useGlobalStore = () => {
	const store = React.useContext(storeContext);

	if (!store) {
		// this is especially useful in TypeScript so you don't need to be checking for null all the time
		throw new Error('useStore must be used within a StoreProvider.');
	}

	return store;
}
