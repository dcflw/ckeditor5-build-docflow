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

  /**
   * Starts the upload process.
   */
  upload() {
    return this.loader.file.then(this.uploadFile.bind(this));
  }

  /**
   * Aborts the upload process.
   */
  abort() {
    if (this.directUpload) {
      this.directUpload.abort();
    }
  }

  /**
   * @param {File} file
   */
  uploadFile(file) {
    return new Promise(async (resolve, reject) => {
      try {
        const directUpload = await this.createDirectUpload(file);
        const documentImage = await this.createDocumentImage(
          directUpload.signed_id,
        );

        resolve({
          default: `/document_images/${documentImage.id}`,
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
    this.directUpload = new DocflowDirectUpload(
      file,
      this.getDirectUploadOptions(),
    );
    this.directUploadPromise = this.directUpload.upload();

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

    /**
     * @type {Promise<DocumentImage>}
     */
    this.documentImagePromise = fetch(url, config)
      .then(response => response.json())
      .then(response => response.document_image);

    return this.documentImagePromise;
  }
}
