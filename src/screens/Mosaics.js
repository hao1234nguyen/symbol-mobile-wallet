import React, { Component } from 'react';
import { StyleSheet, } from 'react-native';
import { Section, ImageBackground, GradientBackground, TitleBar, MosaicDisplay } from '@src/components';
import { connect } from 'react-redux';
import translate from "@src/locales/i18n";

const styles = StyleSheet.create({
	list: {
        marginBottom: 10,
    }
});

type Props = {
    componentId: string,
};

type State = {};

class Mosaics extends Component<Props, State> {
    state = {};

    render() {
        const { ownedMosaics, nativeMosaicNamespaceName, onOpenMenu, onOpenSettings  } = this.props;
        const {} = this.state;

        return (
            //<ImageBackground name="blue" fade={true}>
			<GradientBackground name="connector_small" theme="light">
                <TitleBar
					theme="light"
					title={translate('mosaics.title')}
					onOpenMenu={() => onOpenMenu()}
					onSettings={() => onOpenSettings()}
				/>
                <Section type="list" style={styles.list} isScrollable>
                    {ownedMosaics &&
                        ownedMosaics.map((mosaic, index) => {
                            return <MosaicDisplay mosaic={mosaic} isNative={mosaic.mosaicName === nativeMosaicNamespaceName} key={'' + index + 'mosaics'} />;
                        })}
                </Section>
			</GradientBackground>
			//</ImageBackground>
        );
    }
}

export default connect(state => ({
	ownedMosaics: state.account.ownedMosaics,
	nativeMosaicNamespaceName: 'symbol.xym' //TODO: remove hardcode
}))(Mosaics);
