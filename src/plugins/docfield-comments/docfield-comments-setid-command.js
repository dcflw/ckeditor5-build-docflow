import { AlwaysEnabledCommand } from '../AlwaysEnabledCommand';
import { ID_ATTRIBUTE, MARKER_NAME } from './constants';

export default class DocfieldCommentsSetIdCommand extends AlwaysEnabledCommand {
	findCommentAttributes( root, commentId ) {
		const commentModels = [];

		if ( !root ) {
			return commentModels;
		}

		for ( const child of root.getChildren() ) {
			if ( child.is( 'element' ) ) {
				commentModels.push( ...this.findCommentAttributes( child, commentId ) );
			} else {
				const attr = child.getAttribute( ID_ATTRIBUTE );

				if ( attr === commentId ) {
					commentModels.push( child );
				}
			}
		}

		return commentModels;
	}

	replaceCommentModels( commentModels, commentId, writer ) {
		for ( const commentModel of commentModels ) {
			writer.setAttribute( ID_ATTRIBUTE, commentId, commentModel );
		}
	}

	execute( params = {} ) {
		const { id, newId } = params;

		if ( !id || !newId ) {
			return;
		}

		const model = this.editor.model;
		model.change( writer => {
			for ( const marker of model.markers ) {
				if ( marker.name.startsWith( `${ MARKER_NAME }:${ id }:` ) ) {
					const newMarkerName = marker.name.replace( `${ MARKER_NAME }:${ id }:`, `${ MARKER_NAME }:${ newId }:` );
					const currentMarkers = Array.from( model.markers ) || [];

					if ( currentMarkers.every( marker => marker.name !== newMarkerName ) ) {
						writer.addMarker( newMarkerName, {
							range: marker.getRange(),
							usingOperation: false
						} );
						writer.removeMarker( marker.name );
					}
				}
			}
		} );
	}
}
