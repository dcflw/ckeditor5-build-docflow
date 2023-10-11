import { AlwaysEnabledCommand } from '../AlwaysEnabledCommand';
import { ID_ATTRIBUTE } from './constants';
import { getDataFromMarkerName } from './helper';

export default class DocfieldCommentsRemoveCommand extends AlwaysEnabledCommand {
	findCommentAttributes( root, id ) {
		const commentModels = [];

		if ( !root || !id ) {
			return commentModels;
		}

		for ( const child of root.getChildren() ) {
			if ( child.is( 'element' ) ) {
				commentModels.push( ...this.findCommentAttributes( child, id ) );
			} else {
				const attr = child.getAttribute( ID_ATTRIBUTE );
				if ( attr === id ) {
					commentModels.push( child );
				}
			}
		}

		return commentModels;
	}

	removeCommentModels( commentModels, writer ) {
		for ( const commentModel of commentModels ) {
			writer.removeAttribute( ID_ATTRIBUTE, commentModel );
		}
	}

	execute( { id, comment } ) {
		const model = this.editor.model;

		model.change( writer => {
			for ( const marker of model.markers ) {
				const { commentId, resolved } = getDataFromMarkerName( marker.name );

				if ( commentId === id && ( comment === undefined || String( comment.solved ) === resolved ) ) {
					writer.removeMarker( marker.name );
				}
			}
		} );
	}
}
