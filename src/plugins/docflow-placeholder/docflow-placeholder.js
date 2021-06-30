import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import DocflowPlaceholderEditing from './docflow-placeholder-editing';
import DocflowPlaceholderUi from './docflow-placeholder-ui';

export default class DocflowPlaceholder extends Plugin {
	static get requires() {
		return [ DocflowPlaceholderEditing, DocflowPlaceholderUi ];
	}
}
