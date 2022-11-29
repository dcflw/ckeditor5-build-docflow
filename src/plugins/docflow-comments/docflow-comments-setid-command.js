import Command from "@ckeditor/ckeditor5-core/src/command";

export default class DocflowCommentsSetIdCommand extends Command {
  findCommentAttributes(root) {
    const commentModels = [];

    for (const child of root.getChildren()) {
      if (child.is("element")) {
        commentModels.push(...this.findCommentAttributes(child));
      } else {
        const attr = child.getAttribute("data-comment-id");
        if (attr === "unsaved-comment") {
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

  execute(params) {
    const commentId = params?.id;
    const rootName = params?.rootName;
    const model = this.editor.model;
    model.change(writer => {
      const root = model.document.getRoot(rootName);
      const commentModels = this.findCommentAttributes(root);
      this.replaceCommentModels(commentModels, commentId, writer);
    });
  }
}
