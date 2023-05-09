import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import { COMMAND_INSERT_SMARTFIELD, SMARTFIELD_REGEX } from './docflow-smartfield-editing';
import smartFieldRegular from './theme/icons/smartFieldRegular.svg';
import linkIcon from './theme/icons/link-icon.svg';

const TYPE = {
	InternalLink: 'SmartField::InternalLink',
	String: 'SmartField::String'
};

export default class DocflowSmartfieldUI extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}

	init() {
		const editor = this.editor;

		const config = editor.config.get( 'docflowSmartfield' );

		if ( config && config.enabled ) {
			this.addSmartfieldToolbarButton();
			this.addLinkToolbarButton();
		}
	}

	addSmartfieldToolbarButton() {
		this.editor.ui.componentFactory.add( 'insertSmartfield', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Smart field',
				icon: smartFieldRegular,
				tooltip: true
			} );

			this.listenTo( button, 'execute', () => this.insertNewSmartfield( TYPE.String ) );

			return button;
		} );
	}

	addLinkToolbarButton() {
		this.editor.ui.componentFactory.add( 'insertSmartfieldLink', locale => {
			const dropdownView = createDropdown( locale );

			dropdownView.buttonView.set( {
				label: 'Link',
				icon: linkIcon,
				tooltip: true
			} );

			const items = new Collection();

			items.add( {
				type: 'button',
				model: new Model( {
					id: 'internal-link',
					withText: true,
					label: 'Internal Link'
				} )
			} );
			items.add( {
				type: 'button',
				model: new Model( {
					id: 'external-link',
					withText: true,
					label: 'External Link'
				} )
			} );

			addListToDropdown( dropdownView, items );

			this.listenTo( dropdownView, 'execute', evt => {
				const { id } = evt.source;
				if ( id === 'internal-link' ) {
					this.insertNewSmartfield( TYPE.InternalLink );
				} else if ( id === 'external-link' ) {
					const externalLinkPlugin = this.editor.plugins.get( 'LinkUI' );
					externalLinkPlugin._showUI( true );
				}
			} );

			return dropdownView;
		} );
	}

	insertNewSmartfield( type ) {
		const config = this.editor.config.get( 'docflowSmartfield' );
		const selectedText = this.getSelectedText().trim();
		const isValidSmartfieldName = SMARTFIELD_REGEX.test( `{{${ selectedText }}}` );

		const name = selectedText.replace( / /g, '__' );
		if ( selectedText && !isValidSmartfieldName ) {
			if ( config.onInvalidSmartfieldName ) {
				config.onInvalidSmartfieldName( selectedText );
			}
			return;
		}

		this.editor.execute( COMMAND_INSERT_SMARTFIELD, { name, type } );
	}

	getSelectedText() {
		const results = [];
		const view = this.editor.editing.view;
		const selection = view.document.selection;

		for ( const item of selection.getFirstRange().getItems() ) {
			if ( item.is( 'textProxy' ) ) {
				results.push( item.data );
			}
		}

		return results.join( ' ' ).trim();
	}
}
