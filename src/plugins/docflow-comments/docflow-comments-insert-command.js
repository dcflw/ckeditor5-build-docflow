import Command from '@ckeditor/ckeditor5-core/src/command';
import { ID_ATTRIBUTE, MARKER_NAME } from './constants';
import cuid from 'cuid';

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

				for ( const range of ranges ) {
					const marker = `${ MARKER_NAME }:${ id }:${ cuid() }:false`;
					console.log( 'marker', marker );
					writer.addMarker( marker, {
						range,
						usingOperation: false
					} );
				}
			}
		} );
	}
}
