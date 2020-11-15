import React, { Component } from 'react';
import { Section, GradientBackground, Text, Row, TitleBar, Dropdown, TransactionItem, ListContainer, ListItem } from '@src/components';
import { connect } from 'react-redux';
import MultisigFilter from '@src/components/molecules/MultisigFilter';
import { NetworkType } from 'symbol-sdk';
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import store from '@src/store';

const styles = StyleSheet.create({
    list: {
        marginBottom: 50,
        height: '65%',
    },
    filter: {
        flexGrow: 1,
    },
    filterRight: {
        width: '50%',
        marginLeft: 5,
    },
    loadingText: {
        marginTop: 6,
    },
});

type Props = {};

type State = {};

const allFilters = [
    { value: 'ALL', label: 'All' },
    { value: 'SENT', label: 'Sent' },
    { value: 'RECEIVED', label: 'Received' },
];

class Hardcode {
    // TODO: Move this class to services or middleware. The UI component should recieve already formatted transactions
    static formatTransactions = (rawTransactions, address) => {
        let formattedTransactions = [];

        if (!Array.isArray(rawTransactions)) return [];

        formattedTransactions = rawTransactions.map(el => this.formatTransaction(el, address));
        return formattedTransactions;
    };

    static formatTransaction = (transaction, selectedAccountAddress) => {
        const type = transaction.type;

        switch (type) {
            case 'transfer':
                const nativeMosaic = transaction.mosaics.find(el => el.mosaicName === 'symbol.xym'); //TODO: replace hardcoded native namespace with REST data
                const hasCustomMosaic = transaction.mosaics.filter(el => el.mosaicName !== 'symbol.xym').length; //TODO: replace hardcoded native namespace with REST data

                const amount = nativeMosaic ? nativeMosaic.amount : null;
                const transferType = selectedAccountAddress === transaction.signerAddress ? 'outgoing' : 'incoming';

                const preview = {
                    ...transaction,
                    amount,
                    transferType,
                    hasCustomMosaic,
                };
                return {
                    preview,
                    transaction,
                };
            default:
                return {
                    preview: transaction,
                    transaction,
                };
        }
    };
}

class History extends Component<Props, State> {
    state = {
        showingDetails: -1,
    };

    componentDidMount() {
        // store.dispatchAction({ type: 'account/loadTransactions' });
        // this.props.dataManager.reset();
    };

    showDetails = index => {
        const { showingDetails } = this.state;
        if (showingDetails === index) {
            this.setState({
                showingDetails: -1,
            });
        } else {
            this.setState({
                showingDetails: index,
            });
        }
    };

    onSelectFilter = filterValue => {
        store.dispatchAction({ type: 'transaction/changeFilters', payload: { directionFilter: filterValue } });
        this.setState({ filterValue });
    };

    onSelectMultisig = multisig => {
        store.dispatchAction({ type: 'transaction/changeFilters', payload: { addressFilter: multisig } });
        this.setState({ selectedMultisig: multisig });
    };

    loadNextPage = () => {
        const { isLastPage } = this.props;
        if (!isLastPage) {
            store.dispatchAction({ type: 'transaction/loadNextPage' });
        }
    };

    renderTransactionItem = showingDetails => ({ item, index }) => {
        return (
            <ListItem onPress={() => this.showDetails(index)}>
                <TransactionItem transaction={item.preview} model={item.transaction} showDetails={showingDetails === index} />
            </ListItem>
        );
        return (
            <TouchableOpacity onPress={() => this.showDetails(index)}>
                <TransactionItem transaction={item.preview} model={item.transaction} showDetails={showingDetails === index} />
            </TouchableOpacity>
        );
    };

    render() {
        const { address, cosignatoryOf, onOpenMenu, onOpenSettings, transactions, loading, addressFilter, directionFilter } = this.props;
        const { showingDetails } = this.state;

        const formattedTransactions = Hardcode.formatTransactions(transactions, address);

        return (
            // <ImageBackground name="tanker" dataManager={dataManager}>
            <GradientBackground name="connector_small" theme="light">
                <TitleBar theme="light" title="Transactions" onOpenMenu={() => onOpenMenu()} onSettings={() => onOpenSettings()} />
                <Section type="list">
                    <Section type="form-item">
                        <Row fullWidth>
                            <Dropdown
                                theme="light"
                                style={styles.filter}
                                list={allFilters}
                                title={'Filter'}
                                value={directionFilter}
                                onChange={this.onSelectFilter}
                            />
                            {cosignatoryOf.length > 0 && (
                                <MultisigFilter theme="light" style={styles.filterRight} selected={addressFilter} onSelect={v => this.onSelectMultisig(v)} />
                            )}
                        </Row>
                    </Section>
                </Section>
                <ListContainer style={styles.list} isScrollable={false}>
                    <FlatList
                        data={formattedTransactions}
                        renderItem={this.renderTransactionItem(showingDetails)}
                        onEndReachedThreshold={0.9}
                        onEndReached={this.loadNextPage}
                    />
                    {loading && (
                        <Text theme="light" align="center" style={styles.loadingText}>
                            Loading...
                        </Text>
                    )}
                </ListContainer>
            </GradientBackground>
            // </ImageBackground>
        );
    }
}

export default connect(state => ({
    address: state.account.selectedAccountAddress,
    cosignatoryOf: state.account.cosignatoryOf,
    addressBook: state.addressBook.addressBook,
    privateKey: state.wallet.selectedAccount.privateKey,
    transactions: state.transaction.transactions,
    isLastPage: state.transaction.isLastPage,
    addressFilter: state.transaction.addressFilter,
    directionFilter: state.transaction.directionFilter,
    loading: state.transaction.loading,
}))(History);
