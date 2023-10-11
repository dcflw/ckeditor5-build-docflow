import { Command } from '@ckeditor/ckeditor5-core';
import { TYPE_SMARTFIELD } from './docfield-smartfield-editing';

export default class DocfieldInsertSmartfieldCommand extends Command {
	execute( params ) {
		const editor = this.editor;

		editor.model.change( writer => {
			const smartfield = writer.createElement( TYPE_SMARTFIELD, params );
			editor.model.insertObject( smartfield );
			writer.setSelection( smartfield, 'on' );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const isAllowed = model.schema.checkChild(
			selection.focus.parent,
			'smartfield'
		);

		this.set( 'isEnabled', isAllowed );
	}
}
