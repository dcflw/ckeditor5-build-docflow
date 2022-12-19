import Command from "@ckeditor/ckeditor5-core/src/command";

export default class DocflowCommentsInsertCommand extends Command {
  execute({ id, parentId }) {
    const model = this.editor.model;
    const selection = model.document.selection;

    model.change(writer => {
      if (!selection.isCollapsed) {
        const ranges = model.schema.getValidRanges(
          selection.getRanges(),
          "data-comment-id",
        );

        for (const range of ranges) {
          writer.setAttribute("data-comment-id", id, range);
          writer.setAttribute("data-comment-is-active", true, range);

          parentId && writer.setAttribute("data-comment-parent-id", id, range);
        }
      }
    });
  }
}
