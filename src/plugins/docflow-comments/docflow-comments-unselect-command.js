import Command from '@ckeditor/ckeditor5-core/src/command';
import { MARKER_NAME } from './constants';

export default class DocflowCommentsUnselectCommand extends Command {
	execute() {
		const model = this.editor.model;

		model.change( writer => {
			for ( const marker of Array.from( model.markers ) ) {
				if ( marker.name.startsWith( `${ MARKER_NAME }:` ) ) {
					// eslint-disable-next-line no-unused-vars
					const [ _, commentId, leafId, selected ] = marker.name.split( ':' );

					if ( selected !== 'selected' ) {
						continue;
					}

					const commentMarkerName = `${ MARKER_NAME }:${ commentId }:${ leafId }`;

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
