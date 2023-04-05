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
          console.log("RANGE", range);
          console.log("NODE BEFORE", range.start?.nodeBefore);

          if (range.start?.nodeBefore?.name === "smartfield") {
            console.log("range.start.nodeBefore", range.start.nodeBefore);
            console.log("start", range.start);
            range = writer.createRange(
              model.createPositionFromPath(range.root, [range.start.path[0], range.end.path[1] - 5]),
              model.createPositionFromPath(range.root, range.end.path)
            );
          } else if(range.end?.nodeAfter?.name === "smartfield") {
            range = writer.createRange(
              model.createPositionFromPath(range.root, range.start.path),
              model.createPositionFromPath(range.root, [range.end.path[0], range.end.path[1] - 1])
            );
          }

					const markerName = getMarkerName( id, cuid() );
					const currentMarkers = Array.from( model.markers ) || [];

					if ( currentMarkers.every( marker => marker.name !== markerName ) ) {
						writer.addMarker( markerName, {
							range,
							usingOperation: false
						} );
					}
				}
			}
		} );
	}
}
