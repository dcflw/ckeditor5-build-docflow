import Command from "@ckeditor/ckeditor5-core/src/command";

export const COMMAND_PLACEHOLDER = "placeholder";

export default class DocflowPlaceholderCommand extends Command {
  execute(params) {
    const editor = this.editor;

    editor.model.change(writer => {
      const placeholder = writer.createElement(COMMAND_PLACEHOLDER, params);

      editor.model.insertContent(placeholder);
      writer.setSelectionFocus(placeholder, "after");
    });

    setTimeout(() => editor.editing.view.focus());
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const isAllowed = model.schema.checkChild(
      selection.focus.parent,
      "placeholder",
    );

    this.set("isEnabled", isAllowed);
  }
}
