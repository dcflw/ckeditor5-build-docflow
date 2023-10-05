import { Command } from "@ckeditor/ckeditor5-core";
import { CONFIG_NAMESPACE } from "./docfield-placeholder-editing";

export const COMMAND_VARIABLE = "variable";

export default class DocfieldVariableCommand extends Command {
  execute(params) {
    const editor = this.editor;

    editor.model.change((writer) => {
      const isFrontpage = this.editor.config.get(
        `${CONFIG_NAMESPACE}.frontpage`,
      );
      if (isFrontpage) {
        const styles = Object.fromEntries(
          this.editor.model.document.selection.getAttributes(),
        );
        const insertPosition =
          editor.model.document.selection.getFirstPosition();
        writer.insertText(`{{${params.name}}}`, styles, insertPosition);

        return;
      }
      const variable = writer.createElement(COMMAND_VARIABLE, params);

      editor.model.insertObject(variable);
      writer.setSelectionFocus(variable, "after");
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
