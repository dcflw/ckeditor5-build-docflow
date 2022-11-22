import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import cuid from 'cuid';

export default class DocflowIdGenerator extends Plugin {
	static get pluginName() {
		return 'DocflowIdGenerator';
	}

	init() {
		this.defineSchemes();
		this.defineConverters();
	}

	defineSchemes() {
		const schema = this.editor.model.schema;
		schema.extend( '$block', {
			allowAttributes: [ 'id' ]
		} );
		schema.extend( 'tableCell', {
			allowAttributes: [ 'id' ]
		} );
	}

	defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).attributeToAttribute( {
			view: 'id',
			model: {
				key: 'id',
				value: viewElement => viewElement.getAttribute( 'id' )
			}
		} );

		conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'insert:tableRow', ( evt, data, { writer, mapper } ) => {
				const tableRow = data.item;
				const tableCells = Array.from( tableRow.getChildren() );

				tableCells.forEach( tableCell => {
					writer.setAttribute(
						'id',
						DocflowIdGenerator.generateUniqueId(),
						tableCell
					);
					writer.setAttribute(
						'id',
						DocflowIdGenerator.generateUniqueId(),
						mapper.toViewElement( tableCell )
					);
				} );
			} );

			dispatcher.on( 'insert:paragraph', this.insertIdAttribute );
			dispatcher.on( 'insert:listItem', this.insertIdAttribute );
			dispatcher.on( 'insert:imageInline', this.insertIdAttribute );
		} );

		conversion.for( 'dataDowncast' ).attributeToAttribute( {
			model: {
				name: 'tableCell',
				key: 'id'
			},
			view: modelAttributeValue => {
				return {
					key: 'id',
					value: modelAttributeValue
				};
			}
		} );
	}

	insertIdAttribute( _, data, { writer, mapper } ) {
		const item = data.item;
		const parent = item.parent;
		const prevSibling = item.previousSibling;
		const viewElement = mapper.toViewElement( item );

		let id = item.getAttribute( 'id' );

		if ( parent && parent.name === 'tableCell' ) {
			return;
		}

		if ( ( prevSibling && prevSibling.getAttribute( 'id' ) === id ) || !id ) {
			id = DocflowIdGenerator.generateUniqueId();
			writer.setAttribute( 'id', id, item );
		}

		writer.setAttribute( 'id', id, viewElement );
	}

	static generateUniqueId() {
		return cuid.slug();
	}
}
