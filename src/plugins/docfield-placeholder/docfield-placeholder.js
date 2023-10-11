import { Plugin } from '@ckeditor/ckeditor5-core';

import DocfieldPlaceholderEditing from './docfield-placeholder-editing';
import DocfieldPlaceholderUi from './docfield-placeholder-ui';

export default class DocfieldPlaceholder extends Plugin {
	static get requires() {
		return [ DocfieldPlaceholderEditing, DocfieldPlaceholderUi ];
	}
}
