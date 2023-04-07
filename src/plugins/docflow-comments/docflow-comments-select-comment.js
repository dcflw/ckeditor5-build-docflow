import Command from '@ckeditor/ckeditor5-core/src/command';

export default class DocflowCommentsSelectCommand extends Command {
	execute( { id } ) {
		const model = this.editor.model;
		const view = this.editor.editing.view;


		view.change( writer => {
			for ( const marker of model.markers ) {
				if ( marker.name.startsWith( `comment:${ id }:` ) ) {
					this.editor.editing.mapper.markerNameToElements( marker.name )?.forEach( viewElement => {
						writer.addClass( 'comment-selected', viewElement );
					} );
				} else {
					this.editor.editing.mapper.markerNameToElements( marker.name )?.forEach( viewElement => {
						writer.removeClass( 'comment-selected', viewElement );
					} );
				}
			}
		} );
	}
}
