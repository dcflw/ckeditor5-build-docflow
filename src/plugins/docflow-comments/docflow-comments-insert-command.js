import Command from "@ckeditor/ckeditor5-core/src/command";

export default class DocflowCommentsInsertCommand extends Command {
  execute() {
    const model = this.editor.model;
    const selection = model.document.selection;

    model.change(writer => {
      if (!selection.isCollapsed) {
        const ranges = model.schema.getValidRanges(
          selection.getRanges(),
          "data-comment-id",
        );

        for (const range of ranges) {
          writer.setAttribute("data-comment-id", "unsaved-comment", range);
        }
      }
    });
  }
}
