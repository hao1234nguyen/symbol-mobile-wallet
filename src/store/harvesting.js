import { UInt64 } from 'symbol-sdk';
import HarvestingService from '@src/services/HarvestingService';

export type HarvestingStatus = 'ACTIVE' | 'INACTIVE' | 'INPROGRESS_ACTIVATION' | 'INPROGRESS_DEACTIVATION';

export type HarvestedBlock = {
    blockNo: UInt64,
    fee: UInt64,
};

export type HarvestedBlockStats = {
    totalBlockCount: number,
    totalFeesEarned: UInt64,
};

export default {
    namespace: 'harvesting',
    state: {
        initialized: false,
        harvestedBlocks: null,
        isFetchingHarvestedBlocks: false,
        harvestedBlocksPageInfo: { pageNumber: 1, isLastPage: false },
        status: 'INACTIVE',
        harvestedBlockStats: {
            totalBlockCount: 0,
            totalFeesEarned: UInt64.fromUint(0),
        },
        isFetchingHarvestedBlockStats: false,
    },
    mutations: {
        setInitialized(state, payload) {
            state.harvesting.initialized = payload;
            return state;
        },
        setHarvestedBlocks(state, payload) {
            state.harvesting.initialized = payload;
            return state;
        },
        setIsFetchingHarvestedBlocks(state, payload) {
            state.harvesting.isFetchingHarvestedBlocks = payload;
            return state;
        },
        setHarvestedBlocksPageInfo(state, payload) {
            state.harvesting.harvestedBlocksPageInfo = payload;
            return state;
        },
        setStatus(state, payload) {
            state.harvesting.status = payload;
            return state;
        },
        setHarvestedBlockStats(state, payload) {
            state.harvesting.harvestedBlockStats = payload;
            return state;
        },
        setIsFetchingHarvestedBlockStats(state, payload) {
            state.harvesting.isFetchingHarvestedBlockStats = payload;
            return state;
        },
    },
    actions: {
        init: async ({ dispatchAction }) => {
            await Promise.all([
                dispatchAction({ type: 'harvesting/loadState' }),
                dispatchAction({ type: 'harvesting/loadHarvestedBlocks' }),
                dispatchAction({ type: 'harvesting/loadHarvestedBlocksStats' }),
            ]);
        },
        loadState: async ({ commit, state }) => {
            try {
                const allKeys = await HarvestingService.getAccountKeys(state.wallet.selectedAccount, state.network.selectedNetwork);
                const allKeysLinked = allKeys.linked && allKeys.node && allKeys.vrf;
                commit({ type: 'harvesting/setStatus', payload: allKeysLinked ? 'ACTIVE' : 'INACTIVE' });
            } catch {
                commit({ type: 'harvesting/setStatus', payload: 'INACTIVE' });
            }
        },
        loadHarvestedBlocks: async ({ commit, state }) => {
            const harvestedBlocks = await HarvestingService.getHarvestedBlocks(state.wallet.selectedAccount, state.network.selectedNetwork);
            commit({ type: 'harvesting/setHarvestedBlocks', payload: harvestedBlocks });
        },
        loadHarvestedBlocksStats: async ({ commit, state }) => {
            HarvestingService.getHarvestedBlocksStats(state.wallet.selectedAccount, state.network.selectedNetwork, commit);
        },
        startHarvesting: async ({ state, dispatchAction }, nodePublicKey) => {
            await HarvestingService.doHarvesting('START', state.wallet.selectedAccount, state.network.selectedNetwork, nodePublicKey);
            dispatchAction({ type: 'harvesting/init' });
        },
        stopHarvesting: async ({ state, dispatchAction }) => {
            await HarvestingService.doHarvesting('STOP', state.wallet.selectedAccount, state.network.selectedNetwork);
            dispatchAction({ type: 'harvesting/init' });
        },
        swapHarvesting: async ({ state, dispatchAction }, nodePublicKey) => {
            await HarvestingService.doHarvesting('SWAP', state.wallet.selectedAccount, state.network.selectedNetwork, nodePublicKey);
            dispatchAction({ type: 'harvesting/init' });
        },
    },
};