import DocflowDirectUpload from "./docflow-direct-upload";

export default class DocflowImageUploadAdapter {
  /**
   * @typedef {Object} Options
   * @property {string} directUploadsPath
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
    return this.loader.file.then(
      file =>
        new Promise((resolve, reject) => {
          // this._initRequest();
          // this._initListeners(resolve, reject, file);
          // this._sendRequest(file);

          const directUpload = new DocflowDirectUpload(
            file,
            this.getDirectUploadOptions(),
          );

          directUpload.upload().then(result => {
            console.log(result);
            resolve({ default: "http://placekitten.com/400/300" });
          });

          // @TODO Create DocumentImage and return that URL with `resolve()`
        }),
    );
  }

  // Aborts the upload process.
  abort() {
    // @TODO Cancel the DirectUpload
    // @TODO Delete the DocumentImage

    if (this.xhr) {
      this.xhr.abort();
    }
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
   * @param {string} signedId
   */
  createDocumentImage(signedId) {}

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
