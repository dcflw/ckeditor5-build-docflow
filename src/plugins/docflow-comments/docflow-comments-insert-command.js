import Command from '@ckeditor/ckeditor5-core/src/command';
import { ID_ATTRIBUTE } from './constants';
import cuid from 'cuid';
import { getMarkerName } from './helper';

export default class DocflowCommentsInsertCommand extends Command {
	execute( { id } ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			if ( !selection.isCollapsed ) {
				const ranges = model.schema.getValidRanges(
					selection.getRanges(),
					ID_ATTRIBUTE
				);

				for ( let range of ranges ) {
          if (range.start?.nodeAfter?.name === "smartfield") {
            range = writer.createRange(
              model.createPositionFromPath(range.root, [range.start.path[0], range.start.path[1] + 2]),
              model.createPositionFromPath(range.root, range.end.path)
            );
          } else if(range.end?.nodeBefore?.name === "smartfield") {
            range = writer.createRange(
              model.createPositionFromPath(range.root, range.start.path),
              model.createPositionFromPath(range.root, [range.end.path[0], range.end.path[1] - 2])
            );
          }

					const markerName = getMarkerName( id, 1 );
					const currentMarkers = Array.from( model.markers ) || [];

					if ( currentMarkers.every( marker => marker.name !== markerName ) ) {
						writer.addMarker( markerName, {
							range,
							usingOperation: false,
						} );
					}
				}
			}
		} );
	}
}
