import { Command } from '@ckeditor/ckeditor5-core';

export const COMMAND_PLACEHOLDER = 'placeholder';

export default class DocfieldPlaceholderCommand extends Command {
	execute( params ) {
		const editor = this.editor;

		editor.model.change( writer => {
			const placeholder = writer.createElement( COMMAND_PLACEHOLDER, params );
			editor.model.insertObject( placeholder );
			writer.setSelectionFocus( placeholder, 'after' );
		} );

		setTimeout( () => editor.editing.view.focus() );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const isAllowed = model.schema.checkChild(
			selection.focus.parent,
			'placeholder'
		);

		this.set( 'isEnabled', isAllowed );
	}
}
