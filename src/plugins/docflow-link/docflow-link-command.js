import Command from "@ckeditor/ckeditor5-core/src/command";

export const COMMAND_INTERNAL_LINK = "internalLink";

export default class DocflowLinkCommand extends Command {
  execute(params) {
    const editor = this.editor;

    editor.model.change(writer => {
      const internalLink = writer.createElement(COMMAND_INTERNAL_LINK, params);

      editor.model.insertContent(internalLink);
      writer.setSelectionFocus(internalLink, "after");
    });

    setTimeout(() => editor.editing.view.focus());
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const isAllowed = model.schema.checkChild(
      selection.focus.parent,
      "internalLink",
    );

    this.set("isEnabled", isAllowed);
  }
}
