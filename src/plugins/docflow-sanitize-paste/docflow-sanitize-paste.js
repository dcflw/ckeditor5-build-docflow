import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

export default class DocflowSanitizePaste extends Plugin {
	static get pluginName() {
		return 'DocflowSanitizePaste';
	}
	init() {
		const editor = this.editor;
		const clipboardPlugin = editor.plugins.get( 'Clipboard' );
		const editingView = editor.editing.view;
		const htmlDataProcessor = new HtmlDataProcessor( editingView.document );

		clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
			if ( editor.isReadOnly ) {
				return;
			}

			const dataTransfer = data.dataTransfer;
			const content = this.sanitizeHtml( dataTransfer.getData( 'text/html', true ) );
			data.content = htmlDataProcessor.toView( content );
		} );
	}

	sanitizeHtml( html ) {
		const dom = document.createElement( 'div' );
		dom.innerHTML = html;
		if ( dom.querySelector( 'google-sheets-html-origin' ) !== null ) {
			const style = dom.querySelector( 'style[type=\'text/css\'], style:not([type])' );
			style.parentNode.removeChild( style );
		}

		return dom.innerHTML;
	}
}
