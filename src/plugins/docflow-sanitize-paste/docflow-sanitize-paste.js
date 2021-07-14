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
		let randomCodes = [
			'<!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}-->',
			'<!--br {mso-data-placement:same-cell;}-->',
		  ];
	  
		  for (let code of randomCodes) {
			html = html.replace(`<p>${code}</p>`, '').replace(code, '');
		  }
	  
		  return html;
	}
}
