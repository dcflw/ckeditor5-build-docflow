import Command from "@ckeditor/ckeditor5-core/src/command";

export default class DocflowCommentsSetIdCommand extends Command {
  findAndSetId(children, commentId, writer) {
    for (const child of children) {
      if (child.is("element")) {
        this.findAndSetId(child.getChildren(), commentId, writer);
      } else {
        const attr = child.getAttribute("data-comment-id");
        if (attr === "unsaved-comment") {
          writer.setAttribute("data-comment-id", commentId, child);
        }
      }
    }
  }

  execute(params) {
    const commentId = params?.id;
    const model = this.editor.model;
    model.change(writer => {
      const root = model.document.getRoot();
      const children = root.getChildren();
      this.findAndSetId(children, commentId, writer);
    });
  }
}
