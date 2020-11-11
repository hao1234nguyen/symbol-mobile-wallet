// import Clipboard from '@react-native-community/clipboard';
import { Clipboard } from 'react-native'; // Remove after fix https://github.com/react-native-clipboard/clipboard/issues/71

export const getDropdownListFromObjct = 
	obj => Object
		.keys(obj)
		.map(el => ({
			value: el,
			label: obj[el]
		}));

export const pasteFromClipboard = async () => {
	try {
		const text = await Clipboard.getString();
		return text; 
	}
	catch(e){ return ''; }
};

export const copyToClipboard = (str: string) => {
    Clipboard.setString(str);
};