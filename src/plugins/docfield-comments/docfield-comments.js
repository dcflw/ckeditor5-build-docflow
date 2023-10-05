import { Plugin } from "@ckeditor/ckeditor5-core";
import DocfieldCommentsEditing from "./docfield-comments-editing";

export default class DocfieldComments extends Plugin {
  static get pluginName() {
    return "DocfieldComments";
  }

  static get requires() {
    return [DocfieldCommentsEditing];
  }
}
