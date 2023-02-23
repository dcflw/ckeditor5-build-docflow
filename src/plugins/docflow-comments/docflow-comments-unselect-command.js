import Command from '@ckeditor/ckeditor5-core/src/command';
import { MARKER_NAME } from './constants';
import { getDataFromMarkerName, getMarkerName } from './helper';

export default class DocflowCommentsUnselectCommand extends Command {
	execute() {
		const model = this.editor.model;

		model.change( writer => {
			for ( const marker of Array.from( model.markers ) ) {
				if ( marker.name.startsWith( `${ MARKER_NAME }:` ) ) {
					const { commentId, leafId, solved, selected } = getDataFromMarkerName( marker.name );

					console.log( 'marker', marker.name );
					console.log( 'ID:UNSELECT', commentId, selected, commentId );
					if ( !selected ) {
						continue;
					}

					const commentMarkerName = getMarkerName( commentId, leafId, false, solved );

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
