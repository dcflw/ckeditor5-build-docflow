import Command from '@ckeditor/ckeditor5-core/src/command';
import { MARKER_NAME } from './constants';
import { getDataFromMarkerName, getMarkerName } from './helper';

export default class DocflowCommentsSelectCommand extends Command {
	execute( { id } ) {
		const model = this.editor.model;

		model.change( writer => {
			for ( const marker of Array.from( model.markers ) ) {
				if ( marker.name.startsWith( `${ MARKER_NAME }:` ) ) {
					const { commentId, leafId, solved, selected } = getDataFromMarkerName( marker.name );

					if ( id !== commentId || selected ) {
						continue;
					}
					const commentMarkerName = getMarkerName( commentId, leafId, true, solved );

					writer.addMarker( commentMarkerName, {
						range: marker.getRange(),
						usingOperation: false
					} );
					writer.removeMarker( marker.name );
				}
			}
		} );
	}
}
