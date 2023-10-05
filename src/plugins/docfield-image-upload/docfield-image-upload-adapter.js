import DocfieldDirectUpload from "./docfield-direct-upload";

export default class DocfieldImageUploadAdapter {
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
   * @property {string} documentId
   * @property {string} pathApiDirectUploads
   * @property {string} pathApiImages
   * @property {string} pathImages
   * @property {string} resourceName
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
    // eslint-disable-next-line
    return new Promise(async (resolve, reject) => {
      try {
        const directUpload = await this.createDirectUpload(file);
        const documentImage = await this.createDocumentImage(
          directUpload.signed_id,
        );
        const pathImages = this.options.pathImages || "/images";

        resolve({
          default: `${pathImages}/${documentImage.id}`,
        });
      } catch (error) {
        console.error(error);

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
    this.directUpload = new DocfieldDirectUpload(
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
    const url = this.options.pathApiImages || "/api/v1/images";
    const resourceName = this.options.resourceName || "image";
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
      .then((response) => response.json())
      .then((response) => response[resourceName]);

    return this.documentImagePromise;
  }
}
