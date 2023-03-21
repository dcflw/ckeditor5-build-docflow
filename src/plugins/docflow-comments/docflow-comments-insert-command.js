import Command from '@ckeditor/ckeditor5-core/src/command';
import { ID_ATTRIBUTE } from './constants';
import cuid from 'cuid';
import { getMarkerName } from './helper';

export default class DocflowCommentsInsertCommand extends Command {
	execute( id, rootName, parentId ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			if ( !selection.isCollapsed ) {
				const ranges = model.schema.getValidRanges(
					selection.getRanges(),
					ID_ATTRIBUTE
				);

				const numberOfLeafs = model.document.roots.get( rootName ).childCount;

				const leafIds = Array.from( { length: numberOfLeafs } ).map( () => cuid() );

				for ( const range of ranges ) {
					const rangeStart = range.start;
					const leafIndex = rangeStart.path[ 0 ];
					const markerName = getMarkerName( id, leafIds[ leafIndex ], parentId, true, false );
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
