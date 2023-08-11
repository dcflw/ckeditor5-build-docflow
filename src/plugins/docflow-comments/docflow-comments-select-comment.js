import { AlwaysEnabledCommand } from '../AlwaysEnabledCommand';

export default class DocflowCommentsSelectCommand extends AlwaysEnabledCommand {
	execute( { id } ) {
		const model = this.editor.model;
		const view = this.editor.editing.view;

		view.change( writer => {
			for ( const marker of model.markers ) {
				const viewElements = this.editor.editing.mapper.markerNameToElements( marker.name );

				if ( !viewElements ) {
					continue;
				}

				if ( marker.name.startsWith( `comment:${ id }:` ) ) {
					viewElements.forEach( viewElement => {
						writer.addClass( 'comment-selected', viewElement );
					} );
				} else {
					viewElements.forEach( viewElement => {
						writer.removeClass( 'comment-selected', viewElement );
					} );
				}
			}
		} );
	}
}
