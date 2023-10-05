import { Plugin } from "@ckeditor/ckeditor5-core";
import { Image, ImageUpload } from "@ckeditor/ckeditor5-image";

import DocfieldImageUploadAdapter from "./docfield-image-upload-adapter";
import "./theme/docfield-image-upload.css";

export default class DocfieldImageUpload extends Plugin {
  static get requires() {
    return [Image, ImageUpload];
  }

  constructor(editor) {
    super(editor);

    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      let options = editor.config.get("docfieldImageUpload");

      if (typeof options !== "object") {
        options = {};
      }

      return new DocfieldImageUploadAdapter(loader, options);
    };
  }
}
