import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import DocflowCommentsInsertCommand from './docflow-comments-insert-command';
import DocflowCommentsSetIdCommand from './docflow-comments-setid-command';
import DocflowCommentsRemoveCommand from './docflow-comments-remove-command';
import DocflowCommentsSelectCommand from './docflow-comments-select-comment';
import {
	ID_ATTRIBUTE,
	VIEW_NAME,
	MARKER_NAME,
	MODEL_NAME,
	GROUP_NAME
} from './constants';
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

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => {
				return viewElement.hasAttribute( ID_ATTRIBUTE );
			} )
		);
	}

	defineSchemes() {
		const schema = this.editor.model.schema;

		schema.extend( '$text', {
			allowAttributes: [ ID_ATTRIBUTE ]
		} );
	}

	defineConverters() {
		const editor = this.editor;
		const conversion = editor.conversion;

		conversion.for( 'upcast' ).dataToMarker( {
			view: VIEW_NAME,
			model: name => {
				return `${ MARKER_NAME }:${ name }`;
			},
			converterPriority: 'high'
		} );

		let classNamesCache = [];

		conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: MODEL_NAME,
			converterPriority: 'high',
			view: data => {
        if (data.item.name === "smartfield") {
          return;
        }

				const { commentId } = getDataFromMarkerName( data.markerName );
				const elements = Array.from( editor.editing.mapper.markerNameToElements( data.markerName ) || [] );
				const classNames = elements.length ? elements.flatMap( element => {
					return element.getAttribute( 'class' )?.split( ' ' );
				} ).filter( Boolean ).filter( name => name !== 'comment' ).reduce( ( acc, item ) => {
					// remove duplicates
					const prevItems = acc.filter( prevItem => prevItem !== item );

					return [ ...prevItems, item ];
				}, [] ) : classNamesCache;

				classNamesCache = classNames;

				return {
					attributes: {
		        [ ID_ATTRIBUTE ]: commentId,
		      },
		      classes: [ 'comment', ...classNames ]
				};
			}
		} );

		conversion.for( 'dataDowncast' ).markerToData( {
			model: MODEL_NAME,
			view: markerName => {
				return {
					group: GROUP_NAME,
					name: markerName.substr( 8 )
				};
			},
			converterPriority: 'high'
		} );
	}
}
