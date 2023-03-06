import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import DocflowSmartfieldEditing from './docflow-smartfield-editing';
import DocflowSmartfieldUI from './docflow-smartfield-ui';

export default class DocflowSmartfield extends Plugin {
	static get requires() {
		return [ DocflowSmartfieldEditing, DocflowSmartfieldUI ];
	}
}
