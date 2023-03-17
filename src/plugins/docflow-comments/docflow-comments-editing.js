import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import DocflowCommentsInsertCommand from './docflow-comments-insert-command';
import DocflowCommentsSetIdCommand from './docflow-comments-setid-command';
import DocflowCommentsRemoveCommand from './docflow-comments-remove-command';
import DocflowCommentsSelectCommand from './docflow-comments-select-command';
import DocflowCommentsUnselectCommand from './docflow-comments-unselect-command';
import { ID_ATTRIBUTE, SELECTED_ATTRIBUTE, VIEW_NAME, MARKER_NAME, MODEL_NAME, GROUP_NAME, SOLVED_ATTRIBUTE,
	PARENT_ID_ATTRIBUTE } from './constants';
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

		this.editor.commands.add(
			'selectComment',
			new DocflowCommentsSelectCommand( this.editor )
		);

		this.editor.commands.add(
			'unselectComment',
			new DocflowCommentsUnselectCommand( this.editor )
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
			allowAttributes: [ ID_ATTRIBUTE, SELECTED_ATTRIBUTE, SOLVED_ATTRIBUTE, PARENT_ID_ATTRIBUTE ]
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
				const { commentId, selected, solved, parentId } = getDataFromMarkerName( data.markerName );
				const attributes = {
					[ ID_ATTRIBUTE ]: commentId,
					[ SELECTED_ATTRIBUTE ]: selected,
					[ SOLVED_ATTRIBUTE ]: solved,
					[ PARENT_ID_ATTRIBUTE ]: parentId
				};

				attributes[ SELECTED_ATTRIBUTE ] = selected;
				attributes[ SOLVED_ATTRIBUTE ] = solved;
				attributes[ PARENT_ID_ATTRIBUTE ] = parentId;

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

		this.editor.editing.view.document.on( 'click', ( info, data ) => {
			const { target } = data;
			const attributeKeys = Array.from( target.getAttributeKeys() );

			if ( attributeKeys.includes( ID_ATTRIBUTE ) ) {
				const commentId = target.getAttribute( ID_ATTRIBUTE ).split( ':' )[ 0 ];

				const customEvent = new CustomEvent( 'commentClick', {
					detail: commentId
				} );

				document.dispatchEvent( customEvent );
			}
		} );
	}
}
