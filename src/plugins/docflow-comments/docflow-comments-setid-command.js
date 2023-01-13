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
      writer.setAttribute("data-comment-id", commentId, commentModel);
    }
  }

  execute(params = {}) {
    const { id, newId } = params;

    if (!id || !newId) {
      return;
    }

    const model = this.editor.model;
    model.change(writer => {
      for (const marker of model.markers) {

        if (marker.name.startsWith(`comment:${id}:`) ) {
          const newMarkerName = marker.name.replace(`comment:${id}:`, `comment:${newId}:`);
          writer.addMarker(newMarkerName, {
            range: marker.getRange(),
            usingOperation: false,
          });
          writer.removeMarker(marker.name);
        }
      } 
    });
  }
}
