import { Command } from "@ckeditor/ckeditor5-core";

/** This command will work even when CKEditor is in read-only mode. */
export class AlwaysEnabledCommand extends Command {
  constructor(editor) {
    super(editor);
    this.affectsData = false;
  }
}
