import Command from '@ckeditor/ckeditor5-core/src/command';
import { CONFIG_NAMESPACE } from './docflow-placeholder-editing';

export const COMMAND_VARIABLE = 'variable';

export default class DocflowVariableCommand extends Command {
	execute( params ) {
		const editor = this.editor;

		editor.model.change( writer => {
			const isFrontpage = this.editor.config.get(
				`${ CONFIG_NAMESPACE }.frontpage`
			);
			const variableLabels = this.editor.config.get(
				`${ CONFIG_NAMESPACE }.variableLabels`
			);
			if ( isFrontpage ) {
				const styles = Object.fromEntries( this.editor.model.document.selection.getAttributes() );
				const insertPosition = editor.model.document.selection.getFirstPosition();
				const variableLabel = variableLabels && `{{ ${ variableLabels[ params.name ] } }}`;
				writer.insertText( variableLabel, styles, insertPosition );

				return;
			}
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
