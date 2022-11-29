import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import DocflowCommentsEditing from "./docflow-comments-editing";

export default class DocflowComments extends Plugin {
  static get pluginName() {
    return "DocflowComments";
  }

  static get requires() {
    return [DocflowCommentsEditing];
  }
}
