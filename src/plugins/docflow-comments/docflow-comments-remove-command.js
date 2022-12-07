import Command from "@ckeditor/ckeditor5-core/src/command";

export default class DocflowCommentsRemoveCommand extends Command {
  findCommentAttributes(root, id) {
    const commentModels = [];

    for (const child of root.getChildren()) {
      if (child.is("element")) {
        commentModels.push(...this.findCommentAttributes(child, id));
      } else {
        const attr = child.getAttribute("data-comment-id");
        if (attr === id) {
          commentModels.push(child);
        }
      }
    }

    return commentModels;
  }

  removeCommentModels(commentModels, writer) {
    for (const commentModel of commentModels) {
      writer.removeAttribute("data-comment-id", commentModel);
    }
  }

  execute(params) {
    const id = params?.id;
    const rootName = params?.rootName;
    const model = this.editor.model;
    model.change(writer => {
      const root = model.document.getRoot(rootName);
      const commentModels = this.findCommentAttributes(root, id);
      this.removeCommentModels(commentModels, writer);
    });
  }
}
