import { MultiRootEditor as MultiRootEditorBase } from '@ckeditor/ckeditor5-editor-multi-root';

/** @typedef {import("@ckeditor/ckeditor5-engine").RootElement} RootElement */
/** @typedef {import("@ckeditor/ckeditor5-core").EditorConfig} EditorConfig */
/** @typedef {import("@ckeditor/ckeditor5-editor-multi-root/src/multirooteditor").AddRootOptions} AddRootOptions */

/** The same editor, but manages the asynchrony of adding roots better. */
export class MultiRootEditor extends MultiRootEditorBase {
	/**
   * @param {Record<string, HTMLElement> | Record<string, string>} sourceElementsOrData
   * @param {EditorConfig} config
   */
	constructor( sourceElementsOrData, config = {} ) {
		super( sourceElementsOrData, config );

		/** @type {Map<string, ((RootElement) => void)>} */
		this.rootsPendingAddition = new Map();

		/** @type {Map<string, ((RootElement) => void)>} */
		this.rootsPendingDetaching = new Map();

		/**
     * @param {any} _evt
     * @param {RootElement} root
     */
		this.on( 'addRoot', ( _evt, root ) => {
			if ( this.rootsPendingAddition.has( root.rootName ) ) {
				this.rootsPendingAddition.get( root.rootName )( root );
				this.rootsPendingAddition.delete( root.rootName );
			}
		} );

		/**
     * @param {any} _evt
     * @param {RootElement} root
     */
		this.on( 'detachRoot', ( _evt, root ) => {
			if ( this.rootsPendingDetaching.has( root.rootName ) ) {
				this.rootsPendingDetaching.get( root.rootName )( root );
				this.rootsPendingDetaching.delete( root.rootName );
			}
		} );
	}

	/**
   * @param {string} rootName
   * @param {AddRootOptions} options
   * @returns {Promise<RootElement>}
   */
	addRoot( rootName, options ) {
		return new Promise( resolve => {
			this.rootsPendingAddition.set( rootName, resolve );
			super.addRoot( rootName, options );
		} );
	}

	/**
   * @param {string} rootName
   * @param {boolean} isUndoable
   * @returns {Promise<RootElement>}
   */
	detachRoot( rootName, isUndoable = false ) {
		return new Promise( resolve => {
			this.rootsPendingDetaching.set( rootName, resolve );
			super.detachRoot( rootName, isUndoable );
		} );
	}
}
