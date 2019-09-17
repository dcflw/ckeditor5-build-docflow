import DocflowDirectUpload from "./docflow-direct-upload";

export default class DocflowImageUploadAdapter {
  /**
   * @typedef {Object} DirectUpload
   * @property {number} byte_size
   * @property {string} checksum
   * @property {string} content_type
   * @property {string} created_at
   * @property {string} filename
   * @property {string} id
   * @property {string} key
   * @property {string} signed_id
   */
  /**
   * @typedef {Object} DocumentImage
   * @property {string} id
   * @property {string} document_id
   * @property {string} template_id
   * @property {string} image_url
   */
  /**
   * @typedef {Object} Options
   * @property {string} directUploadsPath
   * @property {string} documentImagesPath
   * @property {string} documentId
   * @property {string} templateId
   */

  /**
   * @param {Object} loader
   * @param {Options} options
   */
  constructor(loader, options = {}) {
    this.loader = loader;
    this.options = options;
  }

  // Starts the upload process.
  upload() {
    return this.loader.file.then(this.uploadFile.bind(this));
  }

  // Aborts the upload process.
  abort() {
    // @TODO Cancel the DirectUpload
    // @TODO Delete the DocumentImage
  }

  /**
   * @param {File} file
   */
  uploadFile(file) {
    return new Promise(async (resolve, reject) => {
      try {
        const directUpload = await this.createDirectUpload(file);

        console.log(directUpload);

        const documentImage = await this.createDocumentImage(
          directUpload.signed_id,
        );

        console.log(documentImage);

        resolve({
          default: documentImage.image_url,
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * @returns {Object}
   */
  getDirectUploadOptions() {
    return {
      ...this.options,
      onProgress: this.handleDirectUploadProgress.bind(this),
    };
  }

  /**
   * @param {ProgressEvent} event
   */
  handleDirectUploadProgress(event) {
    if (event.lengthComputable) {
      this.loader.uploadTotal = event.total;
      this.loader.uploaded = event.loaded;
    }
  }

  /**
   * @param file
   * @returns {Promise<DirectUpload>}
   */
  async createDirectUpload(file) {
    const directUpload = new DocflowDirectUpload(
      file,
      this.getDirectUploadOptions(),
    );

    this.directUploadPromise = directUpload.upload();

    return this.directUploadPromise;
  }

  /**
   * @param {string} signedId
   * @returns {Promise<DocumentImage>}
   */
  async createDocumentImage(signedId) {
    const data = {
      document_id: this.options.documentId,
      template_id: this.options.templateId,
      image_signed_id: signedId,
    };
    const url = this.options.documentImagesPath || "/api/v1/document_images";
    const config = {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    this.documentImagePromise = fetch(url, config)
      .then(response => response.json())
      .then(response => response.document_image);

    return this.documentImagePromise;
  }

  /**
   * @TODO remove everything under here
   */

  // Initializes the XMLHttpRequest object using the URL passed to the constructor.
  _initRequest() {
    const xhr = (this.xhr = new XMLHttpRequest());

    // Note that your request may look different. It is up to you and your editor
    // integration to choose the right communication channel. This example uses
    // a POST request with JSON as a data structure but your configuration
    // could be different.
    xhr.open("POST", "http://example.com/image/upload/path", true);
    xhr.responseType = "json";
  }

  // Initializes XMLHttpRequest listeners.
  _initListeners(resolve, reject, file) {
    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = `Couldn't upload file: ${file.name}.`;

    xhr.addEventListener("error", () => reject(genericErrorText));
    xhr.addEventListener("abort", () => reject());
    xhr.addEventListener("load", () => {
      const response = xhr.response;

      // This example assumes the XHR server's "response" object will come with
      // an "error" which has its own "message" that can be passed to reject()
      // in the upload promise.
      //
      // Your integration may handle upload errors in a different way so make sure
      // it is done properly. The reject() function must be called when the upload fails.
      if (!response || response.error) {
        return reject(
          response && response.error
            ? response.error.message
            : genericErrorText,
        );
      }

      // If the upload is successful, resolve the upload promise with an object containing
      // at least the "default" URL, pointing to the image on the server.
      // This URL will be used to display the image in the content. Learn more in the
      // UploadAdapter#upload documentation.
      resolve({
        default: response.url,
      });
    });

    // Upload progress when it is supported. The file loader has the #uploadTotal and #uploaded
    // properties which are used e.g. to display the upload progress bar in the editor
    // user interface.
    if (xhr.upload) {
      xhr.upload.addEventListener("progress", evt => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }

  // Prepares the data and sends the request.
  _sendRequest(file) {
    // Prepare the form data.
    const data = new FormData();

    data.append("upload", file);

    // Important note: This is the right place to implement security mechanisms
    // like authentication and CSRF protection. For instance, you can use
    // XMLHttpRequest.setRequestHeader() to set the request headers containing
    // the CSRF token generated earlier by your application.

    // Send the request.
    this.xhr.send(data);
  }
}
