import { Plugin } from '@ckeditor/ckeditor5-core';

import DocfieldLinkEditing from './docfield-link-editing';
import DocfieldLinkUI from './docfield-link-ui';

export default class DocfieldLink extends Plugin {
	static get requires() {
		return [ DocfieldLinkEditing, DocfieldLinkUI ];
	}
}
