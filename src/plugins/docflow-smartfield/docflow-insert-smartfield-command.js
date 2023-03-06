import Command from '@ckeditor/ckeditor5-core/src/command';
import { TYPE_SMARTFIELD } from './docflow-smartfield-editing';

export default class DocflowInsertSmartfieldCommand extends Command {
	execute( params ) {
		const editor = this.editor;

		editor.model.change( writer => {
			const smartfield = writer.createElement( TYPE_SMARTFIELD, params );
			editor.model.insertContent( smartfield );
			writer.setSelection( smartfield, 'on' );
		} );

		setTimeout( () => editor.editing.view.focus() );
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
