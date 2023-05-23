import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { viewToModelPositionOutsideModelElement, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import DocflowCommentsInsertCommand from './docflow-comments-insert-command';
import DocflowCommentsSetIdCommand from './docflow-comments-setid-command';
import DocflowCommentsRemoveCommand from './docflow-comments-remove-command';
import DocflowCommentsSelectCommand from './docflow-comments-select-comment';
import {
	ID_ATTRIBUTE,
	RESOLVED_ATTRIBUTE,
	PARENT_ATTRIBUTE,
	VIEW_NAME,
	MARKER_NAME,
	MODEL_NAME,
	GROUP_NAME
} from './constants';
export const TYPE_COMMENT = 'comment';
export const ATTRIBUTE_NAME = 'name';
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
			allowAttributes: [ ID_ATTRIBUTE, RESOLVED_ATTRIBUTE, PARENT_ATTRIBUTE, ATTRIBUTE_NAME ]
		} );

		schema.register( TYPE_COMMENT, {
			allowIn: 'tableCell',
			allowWhere: '$text',
			isInline: true,
			isObject: true,
			allowAttributesOf: '$text',
			allowAttributes: [
				ATTRIBUTE_NAME,
				ID_ATTRIBUTE,
				RESOLVED_ATTRIBUTE,
				PARENT_ATTRIBUTE
			]
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
				if ( data && data.item && data.item.name === 'smartfield' ) {
					return;
				}

				const { commentId, resolved, parentId } = getDataFromMarkerName( data.markerName );
				const elements = Array.from( editor.editing.mapper.markerNameToElements( data.markerName ) || [] );

				// Find current comment in the list of comments
				// Take the class names from the comment
				// Filter out the comment class name
				// Filter out duplicates
				// Add the comment class name to cache. The reason is that when user pres a button this function triggers couple of times
				// And we need to keep the class names from the previous state

				const classNames = elements && elements.length ? elements.flatMap( element => {
					const classAttribute = element.getAttribute( 'class' ) || '';
					return classAttribute.split( ' ' );
				} ).filter( Boolean ).filter( name => name !== 'comment' ).reduce( ( acc, item ) => {
					// remove duplicates
					const prevItems = acc.filter( prevItem => prevItem !== item );

					return [ ...prevItems, item ];
				}, [] ) : classNamesCache;

				classNamesCache = classNames;

				return {
					attributes: {
						[ ID_ATTRIBUTE ]: commentId,
						[ RESOLVED_ATTRIBUTE ]: resolved,
						[ PARENT_ATTRIBUTE ]: parentId
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

		// view-to-model converter
		conversion
			.for( 'upcast' )
			.elementToElement( {
				view: {
					name: 'span',
					classes: 'comment'
				},
				model: ( viewElement, modelConversionApi ) => {
					const commentId = viewElement.getAttribute( 'data-comment-id' );
					const parentId = viewElement.getAttribute( 'data-comment-parent' );
					const resolved = viewElement.getAttribute( 'data-comment-resolved' );
					const classes = viewElement.getAttribute( 'class' ) || '';

					let content = '';

					if ( viewElement.childCount === 1 ) {
						content = viewElement.getChild( 0 ).data;
					}

					console.log( 'commentId', commentId, content );
					return modelConversionApi.writer.createElement( TYPE_COMMENT, { commentId, parentId, resolved, content, classes } );
				}
			} );

		// model-to-view converter (editor)
		conversion
			.for( 'editingDowncast' )
			.elementToElement( {
				model: TYPE_COMMENT,
				view: ( modelItem, viewConversionApi ) => {
					const widgetElement = this.createCommentTag(
						modelItem,
						viewConversionApi,
						true
					);

					return toWidget( widgetElement, viewConversionApi.writer );
				}
			} );

		// model-to-view converter (data)
		conversion
			.for( 'dataDowncast' )
			.elementToElement( {
				model: TYPE_COMMENT,
				view: this.createCommentTag
			} );
	}

	createCommentTag( modelItem, conversionApi ) {
		const viewWriter = conversionApi.writer;
		const commentId = modelItem.getAttribute( 'commentId' );
		const resolved = modelItem.getAttribute( 'resolved' );
		const parentId = modelItem.getAttribute( 'parentId' );
		const content = modelItem.getAttribute( 'content' );
		const classes = modelItem.getAttribute( 'classes' ) || '';

		const attributes = {
			'data-docflow-type': TYPE_COMMENT,
			[ ID_ATTRIBUTE ]: commentId,
			[ RESOLVED_ATTRIBUTE ]: resolved,
			[ PARENT_ATTRIBUTE ]: parentId,
			'class': classes
		};

		const view = viewWriter.createContainerElement( 'span', attributes );
		const innerText = viewWriter.createText( content );

		viewWriter.insert( viewWriter.createPositionAt( view, 0 ), innerText );

		return view;
	}
}
