import { EditorUIView, InlineEditableUIView, ToolbarView, Template } from '@ckeditor/ckeditor5-ui';

/**
 * The multi-root editor UI view. It is a virtual view providing an inline editable, but without
 * any specific arrangement of the components in the DOM.
 */
export default class MultirootEditorUIView extends EditorUIView {
	/**
   * Creates an instance of the multi-root editor UI view.
   *
   * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
   * @param {module:engine/view/view~View} editingView The editing view instance this view is related to.
   * @param {Object.<String,HTMLElement>} editableElements The list of editable elements, containing name and html element
   * for each editable.
   */
	constructor( locale, editingView, editableElements ) {
		super( locale );

		this.locale = locale;
		this.editingView = editingView;

		/**
     * The main toolbar of the multi-root editor UI.
     *
     * @readonly
     * @member {module:ui/toolbar/toolbarview~ToolbarView}
     */
		this.toolbar = new ToolbarView( locale );

		/**
     * The editables of the multi-root editor UI.
     *
     * @readonly
     * @member {Array.<module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView>}
     */
		this.editables = [];

		// Create InlineEditableUIView instance for each editable.
		for ( const editableName of Object.keys( editableElements ) ) {
			this.createEditableUIView( editableName, editableElements[ editableName ] );
		}

		// This toolbar may be placed anywhere in the page so things like font size need to be reset in it.
		// Because of the above, make sure the toolbar supports rounded corners.
		// Also, make sure the toolbar has the proper dir attribute because its ancestor may not have one
		// and some toolbar item styles depend on this attribute.
		Template.extend( this.toolbar.template, {
			attributes: {
				class: [ 'ck-reset_all', 'ck-rounded-corners' ],
				dir: locale.uiLanguageDirection
			}
		} );
	}

	createEditableUIView( rootName, sourceElement ) {
		const editable = new InlineEditableUIView(
			this.locale,
			this.editingView,
			sourceElement
		);

		editable.name = rootName;

		this.editables.push( editable );
		this.registerChild( editable );

		return editable;
	}

	getEditable( rootName ) {
		return this.editables.find( e => e.name === rootName );
	}

	removeEditable( rootName ) {
		const editable = this.getEditable( rootName );

		if ( editable ) {
			const index = this.editables.indexOf( editable );

			this.deregisterChild( editable );
			this.editables.splice( index, 1 );
			editable.destroy();
		}
	}

	/**
   * @inheritDoc
   */
	render() {
		super.render();

		this.registerChild( [ this.toolbar ] );
	}
}
