import Command from "@ckeditor/ckeditor5-core/src/command";

export default class DocflowCommentsRemoveCommand extends Command {
  findCommentAttributes(root, id) {
    const commentModels = [];

    if (!root || !id) {
      return commentModels;
    }

    for (const child of root?.getChildren()) {
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
      writer.removeAttribute("data-comment-is-active", commentModel);
      writer.removeAttribute("data-comment-parent-id", commentModel);
    }
  }

  execute({ id }) {
    const model = this.editor.model;

    model.change(writer => {
      for (const marker of model.markers) {
        marker.name.startsWith(`comment:${id}:`) &&
          writer.removeMarker(marker.name);
      }
    });
  }
}
