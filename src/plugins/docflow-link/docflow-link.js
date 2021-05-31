import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import DocflowLinkEditing from './docflow-link-editing';
import DocflowLinkUI from './docflow-link-ui';

export default class DocflowLink extends Plugin {
	static get requires() {
		return [DocflowLinkEditing, DocflowLinkUI];
	}
}