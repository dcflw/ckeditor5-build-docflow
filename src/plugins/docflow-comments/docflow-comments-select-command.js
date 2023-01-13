import Command from "@ckeditor/ckeditor5-core/src/command";

export default class DocflowCommentsSelectCommand extends Command {
  execute({ id }) {
    const model = this.editor.model;
    

    model.change(writer => {
      for(const marker of Array.from(model.markers)) {
        if(marker.name.startsWith(`comment:`)) {
          const [_, commentId, leafId, selected] = marker.name.split(':');

          if (selected !== 'selected' && commentId !== id) {
            continue;
          }

          let commentMarkerName = `comment:${commentId}:${leafId}`;
          
          if(commentId === id) {
            commentMarkerName += ':selected';
          }

          writer.addMarker(commentMarkerName, {
            range: marker.getRange(),
            usingOperation: false,
          });
          writer.removeMarker(marker.name);
        } 
      }
    });
  }
}
