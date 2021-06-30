import Command from '@ckeditor/ckeditor5-core/src/command';

export const COMMAND_VARIABLE = 'variable';

export default class DocflowVariableCommand extends Command {
	execute( params ) {
		const editor = this.editor;

		editor.model.change( writer => {
			const variable = writer.createElement( COMMAND_VARIABLE, params );

			editor.model.insertContent( variable );
			writer.setSelectionFocus( variable, 'after' );
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
