import { Plugin } from '@ckeditor/ckeditor5-core';
import { HtmlDataProcessor } from '@ckeditor/ckeditor5-engine';

export default class DocfieldSanitizePaste extends Plugin {
	static get pluginName() {
		return 'DocfieldSanitizePaste';
	}
	init() {
		const editor = this.editor;
		const clipboardPlugin = editor.plugins.get( 'ClipboardPipeline' );
		const editingView = editor.editing.view;
		const htmlDataProcessor = new HtmlDataProcessor( editingView.document );

		clipboardPlugin.on( 'inputTransformation', ( evt, data ) => {
			if ( editor.isReadOnly ) {
				return;
			}

			const dataTransfer = data.dataTransfer;
			if ( dataTransfer.types.includes( 'text/html' ) ) {
				const content = this.sanitizeHtml( dataTransfer.getData( 'text/html', true ) );
				data.content = htmlDataProcessor.toView( content );
			}
		} );
	}

	sanitizeHtml( html ) {
		const randomCodes = [
			'<!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}-->',
			'<!--br {mso-data-placement:same-cell;}-->',
			/color:.*?;/g
		];
		for ( const code of randomCodes ) {
			html = html.replace( `<p>${ code }</p>`, '' ).replace( code, '' );
		}

		return html;
	}
}
