import Command from '@ckeditor/ckeditor5-core/src/command';

export const COMMAND_EDIT_PLACEHOLDER = 'editPlaceholder';

export default class DocflowEditPlaceholderCommand extends Command {
	execute( newPlaceholders ) {
		const editor = this.editor;
		editor.model.change( writer => {
			const roots = editor.model.document.roots;
			roots._items.forEach( ( element, index ) => {
				if ( index === 0 ) {
					return;
				}
				const node = roots._items[ index ].getChild( 0 );
				const nodeChildren = node.getChildren();
				let nodeChild = nodeChildren.next();

				while ( !nodeChild.done ) {
					const nodeObject = nodeChild.value;
					if ( nodeObject.name === 'placeholder' ) {
						const newPlaceholder = newPlaceholders.find( placeholder => placeholder.id === nodeObject._attrs.get( 'id' ) );
						if ( newPlaceholder ) {
							writer.setAttribute( 'name', newPlaceholder.name, nodeObject );
						}
					}
					nodeChild = nodeChildren.next();
				}
			} );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const isAllowed = model.schema.checkChild(
			selection.focus.parent,
			'placeholder'
		);

		this.set( 'isEnabled', isAllowed );
	}
}
