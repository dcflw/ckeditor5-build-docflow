import { DirectUpload } from '@rails/activestorage';

const CONVENTIONAL_DIRECT_UPLOADS_PATH = '/rails/active_storage/direct_uploads';

export default class DocfieldDirectUpload {
	/**
   * @param {File} file
   * @param {Object} options
   */
	constructor( file, options = {} ) {
		this.options = options;
		this.directUpload = new DirectUpload(
			file,
			this.getDirectUploadsPath(),
			this
		);
	}

	/**
   * @returns {string}
   */
	getDirectUploadsPath() {
		if ( this.options.directUploadsPath ) {
			return this.options.pathApiDirectUploads;
		} else {
			return CONVENTIONAL_DIRECT_UPLOADS_PATH;
		}
	}

	/**
   * @returns {Promise<unknown>}
   */
	upload() {
		return new Promise( ( resolve, reject ) => {
			this.directUpload.create( ( error, attributes ) => {
				if ( error ) {
					reject( error );
				} else {
					resolve( attributes );
				}
			} );
		} );
	}

	abort() {
		if ( this.xhr ) {
			this.xhr.abort();
		}
	}

	/**
   * @param {XMLHttpRequest} xhr
   */
	directUploadWillStoreFileWithXHR( xhr ) {
		this.xhr = xhr;

		if ( this.options.onProgress ) {
			xhr.upload.addEventListener( 'progress', this.options.onProgress );
		}
	}
}
