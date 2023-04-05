import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import DocflowCommentsInsertCommand from './docflow-comments-insert-command';
import DocflowCommentsSetIdCommand from './docflow-comments-setid-command';
import DocflowCommentsRemoveCommand from './docflow-comments-remove-command';
import { ID_ATTRIBUTE, VIEW_NAME, MARKER_NAME, MODEL_NAME, GROUP_NAME } from './constants';
import { getDataFromMarkerName } from './helper';

export default class DocflowCommentsEditing extends Plugin {
	init() {
		this.defineSchemes();
		this.defineConverters();

		this.editor.commands.add(
			'insertComment',
			new DocflowCommentsInsertCommand( this.editor )
		);

		this.editor.commands.add(
			'setCommentId',
			new DocflowCommentsSetIdCommand( this.editor )
		);

		this.editor.commands.add(
			'removeComment',
			new DocflowCommentsRemoveCommand( this.editor )
		);

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement =>
				viewElement.hasAttribute( ID_ATTRIBUTE )
			)
		);
	}

	defineSchemes() {
		const schema = this.editor.model.schema;

		schema.extend( '$text', {
			allowAttributes: [ ID_ATTRIBUTE ]
		} );
	}

	defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).dataToMarker( {
			view: VIEW_NAME,
			model: name => `${ MARKER_NAME }:${ name }`,
			converterPriority: 'high'
		} );

		conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: MODEL_NAME,
			view: data => {
				const { commentId } = getDataFromMarkerName( data.markerName );
				const attributes = {
					[ ID_ATTRIBUTE ]: commentId
				};

				return {
					attributes
				};
			},
			converterPriority: 'high'
		} );

		conversion.for( 'dataDowncast' ).markerToData( {
			model: MODEL_NAME,
			view: markerName => {
				return {
					group: GROUP_NAME,
					name: markerName.substr( 8 ) // Removes 'comment:' part.
				};
			},
			converterPriority: 'high'
		} );

		this.editor.editing.view.document.on( 'mousedown', ( info, data ) => {
			const { target } = data;
			const attributeKeys = Array.from( target.getAttributeKeys() );

			if ( attributeKeys.includes( ID_ATTRIBUTE ) ) {
				const commentId = target.getAttribute( ID_ATTRIBUTE ).split( ':' )[ 0 ];
				console.log( 'target', target, commentId );

				const customEvent = new CustomEvent( 'commentClick', {
					detail: commentId
				} );

				document.dispatchEvent( customEvent );
			}
		} );
	}
}
