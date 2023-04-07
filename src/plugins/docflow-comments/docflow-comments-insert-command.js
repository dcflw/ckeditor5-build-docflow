import Command from '@ckeditor/ckeditor5-core/src/command';
import { ID_ATTRIBUTE } from './constants';
import cuid from 'cuid';
import { getMarkerName } from './helper';

export default class DocflowCommentsInsertCommand extends Command {
	execute( { id, parentId } ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			if ( !selection.isCollapsed ) {
				const ranges = model.schema.getValidRanges(
					selection.getRanges(),
					ID_ATTRIBUTE
				);

				for ( const range of ranges ) {
          const rangeStartPath = range.start.path;
          const rangeEndPath = range.end.path;

          // Hack for smartfields. If we have a smartfield in the beginning or in the end, we need to adjust the range.
          if (range.start?.nodeAfter?.name === "smartfield") {
            rangeStartPath[1] += 2;
          } if (range.start?.nodeBefore?.name === "smartfield") {
            rangeStartPath[1] += 1;
          } else if(range.end?.nodeBefore?.name === "smartfield") {
            rangeEndPath[1] -= 2;
          } else if(range.end?.nodeBefore?.name === "smartfield" || range.end?.nodeAfter?.name === "smartfield") {
            rangeEndPath[1] -= 1;
          }

          const updatedRange = writer.createRange(
            model.createPositionFromPath(rangeStartPath),
            model.createPositionFromPath(rangeEndPath)
          );
					const markerName = getMarkerName( id, cuid(), parentId );
					const currentMarkers = Array.from( model.markers ) || [];

					if ( currentMarkers.every( marker => marker.name !== markerName ) ) {
            console.log("range", updatedRange);

						writer.addMarker( markerName, {
							updatedRange,
							usingOperation: false,
						} );
					}
				}
			}
		} );
	}
}
