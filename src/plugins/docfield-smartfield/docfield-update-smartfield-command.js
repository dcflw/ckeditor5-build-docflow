import { Command } from "@ckeditor/ckeditor5-core";
import { ATTRIBUTE_NAME, ATTRIBUTE_TYPE } from "./docfield-smartfield-editing";

/** @typedef {import("@ckeditor/ckeditor5-engine").Element} ModelElement */

export default class DocfieldUpdateSmartfieldCommand extends Command {
  /**
   * @param {{ name: string; type: string; modelItem: ModelElement }} params
   */
  execute(params) {
    const editor = this.editor;

    params.modelItem._setAttribute(ATTRIBUTE_NAME, params.name);
    params.modelItem._setAttribute(ATTRIBUTE_TYPE, params.type);

    editor.editing.reconvertItem(params.modelItem);

    editor.model.change((writer) => {
      writer.setSelection(params.modelItem, "on");
    });
  }
}
