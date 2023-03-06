import Command from '@ckeditor/ckeditor5-core/src/command';

export default class DocflowDeleteSmartfieldCommand extends Command {
	execute( params ) {
		const editor = this.editor;

		editor.model.change( writer => {
			writer.remove( params.modelItem );
		} );

		setTimeout( () => editor.editing.view.focus() );
	}
}
