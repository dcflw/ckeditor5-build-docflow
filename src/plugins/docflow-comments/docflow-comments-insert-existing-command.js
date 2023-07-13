import Command from '@ckeditor/ckeditor5-core/src/command';
import { getMarkerName } from './helper';

export default class DocflowCommentsInsertExistingCommand extends Command {
	execute( { id, comment } ) {
		const model = this.editor.model;
		model.change( writer => {
			for ( const leaf of comment.highlightLeafs ) {
				const { startPath, startOffset, endPath, endOffset, leafId, parentId } =
          leaf;

				const startPosition = writer.createPositionFromPath(
					model.document.getRoot(),
					startPath
				);
				startPosition.offset = startOffset;

				const endPosition = writer.createPositionFromPath(
					model.document.getRoot(),
					endPath
				);
				endPosition.offset = endOffset;

				const range = writer.createRange( startPosition, endPosition );
				const markerName = getMarkerName(
					id,
					leafId,
					parentId,
					comment.solved
				);
				const currentMarkers = Array.from( model.markers ) || [];

				if ( currentMarkers.every( marker => marker.name !== markerName ) ) {
					writer.addMarker( markerName, {
						range,
						usingOperation: false,
						affectsData: true
					} );
				}
			}
		} );
	}
}

