import Command from "@ckeditor/ckeditor5-core/src/command";

export default class DocflowCommentsSetIdCommand extends Command {
  findCommentAttributes(root, commentId) {
    const commentModels = [];

    if (!root) {
      return commentModels;
    }

    for (const child of root.getChildren()) {
      if (child.is("element")) {
        commentModels.push(...this.findCommentAttributes(child, commentId));
      } else {
        const attr = child.getAttribute("data-comment-id");

        if (attr === commentId) {
          commentModels.push(child);
        }
      }
    }

    return commentModels;
  }

  replaceCommentModels(commentModels, commentId, writer) {
    for (const commentModel of commentModels) {
      commentId
        ? writer.setAttribute("data-comment-id", commentId, commentModel)
        : writer.removeAttribute("data-comment-id", commentModel);
    }
  }

  execute(params = {}) {
    const { id, newId } = params;

    if (!id || !newId) {
      return;
    }

    const model = this.editor.model;
    model.change(writer => {
      const roots = model.document.getRootNames();
      for (const rootName of roots) {
        const root = model.document.getRoot(rootName);
        const commentModels = this.findCommentAttributes(root, id);
        this.replaceCommentModels(commentModels, newId, writer);
      }
    });
  }
}
