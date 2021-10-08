import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	toWidget,
	viewToModelPositionOutsideModelElement
} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import DocflowPlaceholderCommand, {
	COMMAND_PLACEHOLDER
} from './docflow-placeholder-command';
import DocflowEditPlaceholderCommand, {
	COMMAND_EDIT_PLACEHOLDER
} from './docflow-edit-placeholder-command';
import DocflowVariableCommand, {
	COMMAND_VARIABLE
} from './docflow-variable-command';
import './theme/docflow-placeholder.css';

export const ATTRIBUTE_ID = 'id';
export const ATTRIBUTE_NAME = 'name';
export const ATTRIBUTE_PLACEHOLDER_TYPE = 'placeholderType';
export const CONFIG_NAMESPACE = 'docflowPlaceholder';
export const CUSTOM_PROPERTY_ID = 'id';
export const CUSTOM_PROPERTY_NAME = 'name';
export const CUSTOM_PROPERTY_TYPE = 'type';
export const CUSTOM_PROPERTY_PLACEHOLDER_TYPE = 'placeholderType';
export const TYPE_PLACEHOLDER = 'placeholder';
export const TYPE_VARIABLE = 'variable';

export default class DocflowPlaceholderEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this.defineSchema();
		this.defineConverters();

		this.editor.commands.add(
			COMMAND_PLACEHOLDER,
			new DocflowPlaceholderCommand( this.editor )
		);

		this.editor.commands.add(
			COMMAND_EDIT_PLACEHOLDER,
			new DocflowEditPlaceholderCommand( this.editor )
		);
		this.editor.commands.add(
			COMMAND_VARIABLE,
			new DocflowVariableCommand( this.editor )
		);

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement =>
				viewElement.hasClass( TYPE_PLACEHOLDER )
			)
		);
		this.editor.config.define( CONFIG_NAMESPACE, {
			formComponent: undefined,
			formComponentProps: {},
			variableLabels: {}
		} );
	}

	defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( TYPE_PLACEHOLDER, {
			allowIn: 'tableCell',
			allowWhere: '$text',
			isInline: true,
			isObject: true,
			allowAttributes: [
				ATTRIBUTE_ID,
				ATTRIBUTE_NAME,
				ATTRIBUTE_PLACEHOLDER_TYPE
			]
		} );
		schema.register( TYPE_VARIABLE, {
			allowIn: 'tableCell',
			allowWhere: '$text',
			isInline: true,
			isObject: true,
			allowAttributes: [ ATTRIBUTE_NAME ]
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
						'data-redactor-type': TYPE_PLACEHOLDER
					}
				},
				model: ( viewElement, modelWriter ) => {
					const id = viewElement.getAttribute( 'data-uuid' );
					const placeholderType = viewElement.getAttribute(
						'data-placeholder-type'
					);
					let name = '';

					if ( viewElement.childCount === 1 ) {
						name = viewElement.getChild( 0 ).data;
					}
					return modelWriter.createElement( TYPE_PLACEHOLDER, {
						name,
						id,
						placeholderType
					} );
				}
			} )
			.elementToElement( {
				view: {
					name: 'span',
					attributes: {
						'data-redactor-type': TYPE_VARIABLE
					}
				},
				model: ( viewElement, modelWriter ) => {
					let name = 'ERROR';

					if ( viewElement.childCount === 1 ) {
						name = viewElement.getChild( 0 ).data;
					}

					return modelWriter.createElement( TYPE_VARIABLE, { name } );
				}
			} );

		// model-to-view converter (editor)
		conversion
			.for( 'editingDowncast' )
			.elementToElement( {
				model: TYPE_PLACEHOLDER,
				view: ( modelItem, viewWriter ) => {
					const widgetElement = this.createViewPlaceholder(
						modelItem,
						viewWriter,
						true
					);

					return toWidget( widgetElement, viewWriter );
				}
			} )
			.elementToElement( {
				model: TYPE_VARIABLE,
				view: ( modelItem, viewWriter ) => {
					const widgetElement = this.createViewVariable(
						modelItem,
						viewWriter,
						true
					);

					return toWidget( widgetElement, viewWriter );
				}
			} )
			.add( dispatcher => dispatcher.on( 'attribute:name', this.editViewPlaceholder ) );

		// model-to-view converter (data)
		conversion
			.for( 'dataDowncast' )
			.elementToElement( {
				model: TYPE_PLACEHOLDER,
				view: this.createViewPlaceholder
			} )
			.elementToElement( {
				model: TYPE_VARIABLE,
				view: this.createViewVariable
			} )
			.add( dispatcher => dispatcher.on( 'attribute:name', this.editViewPlaceholder ) );
	}

	editViewPlaceholder( evt, data, conversionApi ) {
		conversionApi.consumable.consume( data.item, 'attribute' );
		const modelElement = data.item;
		// Mark element as consumed by conversion.
		conversionApi.consumable.consume( data.item, evt.name );

		// Get mapped view element to update.
		const viewElement = conversionApi.mapper.toViewElement( modelElement );

		// remove placeholder
		conversionApi.writer.remove( viewElement.getChild( 0 ) );

		// Set new placeholder content
		const placeholder = conversionApi.writer.createText( data.attributeNewValue || '' );
		conversionApi.writer.insert( conversionApi.writer.createPositionAt( viewElement, 0 ), placeholder );
	}

	createViewPlaceholder( modelItem, viewWriter, editorView = false ) {
		const id = modelItem.getAttribute( 'id' );
		const placeholderType = modelItem.getAttribute( 'placeholderType' );
		const attributes = {
			'data-redactor-type': TYPE_PLACEHOLDER,
			'data-uuid': id,
			'data-placeholder-type': placeholderType
		};

		let name = '';
		if ( editorView ) {
			const placeholders = this.editor.config.get(
				`${ CONFIG_NAMESPACE }.placeholders`
			);
			const placeholder = placeholders.find( placeholder => placeholder.id === id );

			if ( placeholder ) {
				name = placeholder.name;
			}
			attributes.class = 'placeholder';
		}
		const view = viewWriter.createContainerElement( 'span', attributes );
		const innerText = viewWriter.createText( name );

		viewWriter.insert( viewWriter.createPositionAt( view, 0 ), innerText );
		viewWriter.setCustomProperty( CUSTOM_PROPERTY_TYPE, TYPE_PLACEHOLDER, view );
		viewWriter.setCustomProperty( CUSTOM_PROPERTY_NAME, name, view );
		viewWriter.setCustomProperty( CUSTOM_PROPERTY_ID, id, view );
		viewWriter.setCustomProperty(
			CUSTOM_PROPERTY_PLACEHOLDER_TYPE,
			placeholderType,
			view
		);

		return view;
	}

	createViewVariable( modelItem, viewWriter, editorView = false ) {
		const name = modelItem.getAttribute( 'name' );
		const attributes = {
			'data-redactor-type': TYPE_VARIABLE
		};
		let variableLabel = name;

		if ( editorView ) {
			const variableLabels = this.editor.config.get(
				`${ CONFIG_NAMESPACE }.variableLabels`
			);

			if ( variableLabels[ name ] ) {
				variableLabel = variableLabels[ name ];
			}

			attributes.class = 'placeholder';
		}

		const view = viewWriter.createContainerElement( 'span', attributes );
		const innerText = viewWriter.createText( variableLabel );

		viewWriter.insert( viewWriter.createPositionAt( view, 0 ), innerText );
		viewWriter.setCustomProperty( CUSTOM_PROPERTY_TYPE, TYPE_VARIABLE, view );
		viewWriter.setCustomProperty( CUSTOM_PROPERTY_NAME, name, view );

		return view;
	}
}
