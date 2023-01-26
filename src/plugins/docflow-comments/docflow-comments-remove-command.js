import Command from '@ckeditor/ckeditor5-core/src/command';
import { ID_ATTRIBUTE, MARKER_NAME } from './constants';

export default class DocflowCommentsRemoveCommand extends Command {
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

	execute( { id } ) {
		const model = this.editor.model;

		model.change( writer => {
			for ( const marker of model.markers ) {
				if ( marker.name.startsWith( `${ MARKER_NAME }:${ id }:` ) ) {
					writer.removeMarker( marker.name );
				}
			}
		} );
	}
}
