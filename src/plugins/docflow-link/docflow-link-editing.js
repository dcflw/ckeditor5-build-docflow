import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	toWidget,
	viewToModelPositionOutsideModelElement
} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import DocflowLinkCommand, {
	COMMAND_INTERNAL_LINK
} from './docflow-link-command';
import './theme/docflow-link.css';

export const ATTRIBUTE_ID = 'id';
export const ATTRIBUTE_NAME = 'name';
export const ATTRIBUTE_REFERENCE = 'reference';
export const CONFIG_NAMESPACE = 'docflowLink';
export const CUSTOM_PROPERTY_ID = 'id';
export const CUSTOM_PROPERTY_NAME = 'name';
export const CUSTOM_PROPERTY_REFERENCE = 'reference';
export const CUSTOM_PROPERTY_TYPE = 'type';
export const TYPE_INTERNAL_LINK = 'InternalLink';
export const TYPE_MISSING_REFERENCE = 'MissingReference';

export default class DocflowLinkEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this.defineSchema();
		this.defineConverters();

		this.editor.commands.add(
			COMMAND_INTERNAL_LINK,
			new DocflowLinkCommand( this.editor )
		);

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement =>
				viewElement.hasClass( 'internalLink' )
			)
		);
		this.editor.config.define( CONFIG_NAMESPACE, {
			formComponent: undefined,
			formComponentProps: {}
		} );
	}

	defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( TYPE_INTERNAL_LINK, {
			allowIn: 'tableCell',
			allowWhere: '$text',
			isInline: true,
			isObject: true,
			allowAttributes: [ ATTRIBUTE_ID, ATTRIBUTE_NAME, ATTRIBUTE_REFERENCE ]
		} );

		schema.register( TYPE_MISSING_REFERENCE, {
			allowIn: 'tableCell',
			allowWhere: '$text',
			isInline: true,
			isObject: true,
			allowAttributes: [ ATTRIBUTE_ID, ATTRIBUTE_NAME, ATTRIBUTE_REFERENCE ]
		} );
	}

	defineConverters() {
		const conversion = this.editor.conversion;

		// view-to-model converter
		conversion
			.for( 'upcast' )
			.elementToElement( {
				view: {
					name: 'span',
					attributes: {
						'data-docflow-type': TYPE_INTERNAL_LINK
					}
				},
				model: ( viewElement, modelConversionApi ) => {
					const id = viewElement.getAttribute( 'data-reference-uuid' );
					const reference = viewElement.getAttribute( 'data-reference-type' );
					let name = '';

					if ( viewElement.childCount === 1 ) {
						name = viewElement.getChild( 0 ).data;
					}

					return modelConversionApi.writer.createElement( TYPE_INTERNAL_LINK, { id, reference, name } );
				}
			} );

		// model-to-view converter (editor)
		conversion
			.for( 'editingDowncast' )
			.elementToElement( {
				model: TYPE_INTERNAL_LINK,
				view: ( modelItem, viewConversionApi ) => {
					const widgetElement = this.createViewInternalLink(
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
				model: TYPE_INTERNAL_LINK,
				view: this.createViewInternalLink
			} );

		// view-to-model converter (Missing Reference)
		conversion
			.for( 'upcast' )
			.elementToElement( {
				view: {
					name: 'span',
					classes: [ 'missing-reference' ]
				},
				model: ( viewElement, modelConversionApi ) => {
					let name = '';

					if ( viewElement.childCount === 1 ) {
						name = viewElement.getChild( 0 ).data;
					}

					return modelConversionApi.writer.createElement( TYPE_MISSING_REFERENCE, { name } );
				}
			} );

		// model-to-view converter (Missing Reference)
		conversion
			.for( 'editingDowncast' )
			.elementToElement( {
				model: TYPE_MISSING_REFERENCE,
				view: ( modelItem, viewConversionApi ) => {
					const widgetElement = this.createMissingReference( modelItem, viewConversionApi );

					return toWidget( widgetElement, viewConversionApi.writer );
				}
			} );

		conversion
			.for( 'dataDowncast' )
			.elementToElement( {
				model: TYPE_MISSING_REFERENCE,
				view: this.createMissingReference
			} );
	}

	createViewInternalLink( modelItem, conversionApi, editorView = false ) {
		const viewWriter = conversionApi.writer;
		const name = modelItem.getAttribute( 'name' );
		const id = modelItem.getAttribute( 'id' );
		const reference = modelItem.getAttribute( 'reference' );

		const attributes = {
			'data-docflow-type': TYPE_INTERNAL_LINK,
			'data-reference-uuid': id,
			'data-reference-type': reference
		};

		if ( editorView ) {
			attributes.class = 'internalLink';
		}

		const view = viewWriter.createContainerElement( 'span', attributes );
		const innerText = viewWriter.createText( name );

		viewWriter.insert( viewWriter.createPositionAt( view, 0 ), innerText );
		viewWriter.setCustomProperty( CUSTOM_PROPERTY_TYPE, TYPE_INTERNAL_LINK, view );
		viewWriter.setCustomProperty( CUSTOM_PROPERTY_NAME, name, view );
		viewWriter.setCustomProperty( CUSTOM_PROPERTY_ID, id, view );
		viewWriter.setCustomProperty( CUSTOM_PROPERTY_REFERENCE, reference, view );

		return view;
	}

	createMissingReference( modelItem, conversionApi ) {
		const viewWriter = conversionApi.writer;
		const name = modelItem.getAttribute( 'name' );

		const attributes = {
			class: 'missing-reference',
			'data-docflow-type': TYPE_MISSING_REFERENCE
		};

		const view = viewWriter.createContainerElement( 'span', attributes );
		const innerText = viewWriter.createText( name );

		viewWriter.insert( viewWriter.createPositionAt( view, 0 ), innerText );
		viewWriter.setCustomProperty( CUSTOM_PROPERTY_TYPE, TYPE_MISSING_REFERENCE, view );
		viewWriter.setCustomProperty( CUSTOM_PROPERTY_NAME, name, view );

		return view;
	}
}
