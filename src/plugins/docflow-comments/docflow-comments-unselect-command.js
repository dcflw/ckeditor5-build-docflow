import Command from "@ckeditor/ckeditor5-core/src/command";

export default class DocflowCommentsUnselectCommand extends Command {
  execute() {
    const model = this.editor.model;
    

    model.change(writer => {
      for(const marker of Array.from(model.markers)) {
        if(marker.name.startsWith(`comment:`)) {
          const [_, commentId, leafId, selected] = marker.name.split(':');

          if (selected !== 'selected') {
            continue;
          }

          let commentMarkerName = `comment:${commentId}:${leafId}`;
  
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
