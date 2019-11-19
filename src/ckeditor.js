/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import InlineEditorBase from "@ckeditor/ckeditor5-editor-inline/src/inlineeditor";

import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Strikethrough from "@ckeditor/ckeditor5-basic-styles/src/strikethrough";
import Underline from "@ckeditor/ckeditor5-basic-styles/src/underline";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Image from "@ckeditor/ckeditor5-image/src/image";
import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle";
import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar";
import Link from "@ckeditor/ckeditor5-link/src/link";
import List from "@ckeditor/ckeditor5-list/src/list";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import PasteFromOffice from "@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice";
import Table from "@ckeditor/ckeditor5-table/src/table";
import TableToolbar from "@ckeditor/ckeditor5-table/src/tabletoolbar";

import DocflowImageUpload from "./plugins/docflow-image-upload/docflow-image-upload";
import DocflowPlaceholder from "./plugins/docflow-placeholder/docflow-placeholder";

export default class DocflowEditor extends InlineEditorBase {}

// Plugins to include in the build.
DocflowEditor.builtinPlugins = [
  Essentials,
  Bold,
  DocflowImageUpload,
  DocflowPlaceholder,
  Image,
  ImageStyle,
  ImageToolbar,
  Italic,
  Link,
  List,
  Paragraph,
  PasteFromOffice,
  Strikethrough,
  Table,
  TableToolbar,
  Underline,
];

// Editor configuration.
DocflowEditor.defaultConfig = {
  // This value must be kept in sync with the language defined in webpack.config.js.
  language: "en",
  toolbar: {
    items: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "bulletedList",
      "numberedList",
      "insertTable",
      "insertPlaceholder",
      "link",
      "imageUpload",
      "|",
      "undo",
      "redo",
    ],
  },
  image: {
    styles: ["alignLeft", "alignRight", "full"],
    toolbar: [
      "imageStyle:alignLeft",
      "imageStyle:full",
      "imageStyle:alignRight",
    ],
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
};
