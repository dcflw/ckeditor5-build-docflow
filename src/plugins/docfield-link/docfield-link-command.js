import { Command } from "@ckeditor/ckeditor5-core";

export const COMMAND_INTERNAL_LINK = "InternalLink";

export default class DocfieldLinkCommand extends Command {
  execute(params) {
    const editor = this.editor;

    editor.model.change((writer) => {
      const internalLink = writer.createElement(COMMAND_INTERNAL_LINK, params);

      editor.model.insertObject(internalLink);
      writer.setSelectionFocus(internalLink, "after");
    });

    setTimeout(() => editor.editing.view.focus());
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const isAllowed = model.schema.checkChild(
      selection.focus.parent,
      "InternalLink",
    );

    this.set("isEnabled", isAllowed);
  }
}
