import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';

import DocflowImageUploadAdapter from './docflow-image-upload-adapter';
import './theme/docflow-image-upload.css';

export default class DocflowImageUpload extends Plugin {
	static get requires() {
		return [ Image, ImageUpload ];
	}

	constructor( editor ) {
		super( editor );

		editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => {
			let options = editor.config.get( 'docflowImageUpload' );

			if ( typeof options !== 'object' ) {
				options = {};
			}

			return new DocflowImageUploadAdapter( loader, options );
		};
	}
}
