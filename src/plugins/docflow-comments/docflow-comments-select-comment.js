import Command from '@ckeditor/ckeditor5-core/src/command';
import { getDataFromMarkerName } from './helper';

export default class DocflowCommentsSelectCommand extends Command {
	execute( { ids } ) {
		const model = this.editor.model;
		const view = this.editor.editing.view;

		view.change( writer => {
			for ( const marker of model.markers ) {
				const viewElements = this.editor.editing.mapper.markerNameToElements( marker.name );

				if ( !viewElements ) {
					continue;
				}

				const { commentId } = getDataFromMarkerName( marker.name );

				if ( ids.includes( commentId ) ) {
					viewElements.forEach( viewElement => {
						writer.addClass( 'comment-selected', viewElement );
					} );
				} else {
					viewElements.forEach( viewElement => {
						writer.removeClass( 'comment-selected', viewElement );
					} );
				}
			}
		} );
	}
}
