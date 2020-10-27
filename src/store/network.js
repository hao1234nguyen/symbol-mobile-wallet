import { AsyncCache } from '@src/utils/storage/AsyncCache';
import { getDefaultNetworkType, getNodes } from '@src/config/environment';
import { fetchNetworkInfo } from '@src/utils/SymbolNetwork';

export default {
    namespace: 'network',
    state: {
        isLoaded: false,
        generationHash: '',
        network: 'testnet',
        selectedNode: '',
    },
    mutations: {
        setIsLoaded(state, payload) {
            state.settings.isLoaded = payload;
            return state;
        },
        setGenerationHash(state, payload) {
            console.log(payload);
            state.settings.generationHash = payload;
            return state;
        },
        setNetwork(state, payload) {
            console.log(payload);
            state.settings.network = payload;
            return state;
        },
        setSelectedNode(state, payload) {
            console.log(payload);
            state.settings.network = payload;
            return state;
        },
    },
    actions: {
        initState: async ({ commit, state }) => {
            let selectedNode = await AsyncCache.getSelectedNode();
            if (!selectedNode) {
                const network = getDefaultNetworkType();
                selectedNode = getNodes(network)[0];
            }
            const networkInfo = await fetchNetworkInfo(selectedNode);
            commit({ type: 'network/setGenerationHash', payload: networkInfo.generationHash });
            commit({ type: 'network/setNetwork', payload: networkInfo.network });
            commit({ type: 'network/setSelectedNode', payload: selectedNode });
            commit({ type: 'network/setIsLoaded', payload: true });
        },
        changeNode: async ({ commit, state }, payload) => {
            const networkInfo = await fetchNetworkInfo(payload);
            commit({ type: 'network/setGenerationHash', payload: networkInfo.generationHash });
            commit({ type: 'network/setNetwork', payload: networkInfo.network });
            commit({ type: 'network/setSelectedNode', payload: payload });
            commit({ type: 'network/setIsLoaded', payload: true });
        },
    },
};
