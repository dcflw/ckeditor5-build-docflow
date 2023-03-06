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
					const markerName = getMarkerName( id, cuid(), parentId, true, false );
					writer.addMarker( markerName, {
						range,
						usingOperation: false
					} );
				}
			}
		} );
	}
}
