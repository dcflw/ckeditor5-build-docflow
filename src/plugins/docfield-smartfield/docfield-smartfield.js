import { Plugin } from "@ckeditor/ckeditor5-core";

import DocfieldSmartfieldEditing from "./docfield-smartfield-editing";
import DocfieldSmartfieldUI from "./docfield-smartfield-ui";

export default class DocfieldSmartfield extends Plugin {
  static get requires() {
    return [DocfieldSmartfieldEditing, DocfieldSmartfieldUI];
  }
}
