import Command from "@ckeditor/ckeditor5-core/src/command";

export default class DocflowCommentsRemoveCommand extends Command {
  findAndRemove(children, writer) {
    for (const child of children) {
      if (child.is("element")) {
        this.findAndRemove(child.getChildren(), writer);
      } else {
        const attr = child.getAttribute("data-comment-id");
        if (attr === "unsaved-comment") {
          writer.removeAttribute("data-comment-id", child);
        }
      }
    }
  }

  execute() {
    const model = this.editor.model;
    model.change(writer => {
      const root = model.document.getRoot();
      const children = root.getChildren();
      this.findAndRemove(children, writer);
    });
  }
}
