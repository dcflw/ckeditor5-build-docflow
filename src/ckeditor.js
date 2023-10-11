import { InlineEditor } from "@ckeditor/ckeditor5-editor-inline";

import { Alignment } from "@ckeditor/ckeditor5-alignment";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
} from "@ckeditor/ckeditor5-basic-styles";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { Font } from "@ckeditor/ckeditor5-font";
import { Image, ImageStyle, ImageToolbar } from "@ckeditor/ckeditor5-image";
import { Indent, IndentBlock } from "@ckeditor/ckeditor5-indent";
import { Link } from "@ckeditor/ckeditor5-link";
import { List, ListProperties } from "@ckeditor/ckeditor5-list";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { PasteFromOffice } from "@ckeditor/ckeditor5-paste-from-office";
import { RemoveFormat } from "@ckeditor/ckeditor5-remove-format";
import {
  Table,
  TableCellProperties,
  TableProperties,
  TableKeyboard,
  TableToolbar,
} from "@ckeditor/ckeditor5-table";

import MultirootEditor from "./editors/multiroot-editor";
import DocfieldImageUpload from "./plugins/docfield-image-upload/docfield-image-upload";
import DocfieldLink from "./plugins/docfield-link/docfield-link";
import DocfieldPlaceholder from "./plugins/docfield-placeholder/docfield-placeholder";
import DocfieldSanitizePaste from "./plugins/docfield-sanitize-paste/docfield-sanitize-paste";
import DocfieldComments from "./plugins/docfield-comments/docfield-comments";
import DocfieldSmartfield from "./plugins/docfield-smartfield/docfield-smartfield";
import "./ckeditor.css";

const plugins = [
  Essentials,
  Alignment,
  Bold,
  DocfieldImageUpload,
  DocfieldPlaceholder,
  DocfieldLink,
  DocfieldSanitizePaste,
  DocfieldSmartfield,
  Font,
  Indent,
  IndentBlock,
  Image,
  ImageStyle,
  ImageToolbar,
  Italic,
  Link,
  List,
  ListProperties,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  Strikethrough,
  Table,
  TableCellProperties,
  TableKeyboard,
  TableProperties,
  TableToolbar,
  Underline,
  DocfieldComments,
];

InlineEditor.builtinPlugins = plugins;
MultirootEditor.builtinPlugins = plugins;

const config = {
  // This value must be kept in sync with the language defined in webpack.config.js.
  language: "en",
  toolbar: {
    items: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "outdent",
      "indent",
      "|",
      "bulletedList",
      "numberedList",
      "insertTable",
      "insertPlaceholder",
      "insertSmartfield",
      "docfieldLink",
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
    contentToolbar: [
      "tableColumn",
      "tableRow",
      "mergeTableCells",
      "tableProperties",
      "tableCellProperties",
    ],
  },
};

InlineEditor.defaultConfig = config;
MultirootEditor.defaultConfig = config;

export default { InlineEditor, MultirootEditor };
