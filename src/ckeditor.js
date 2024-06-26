import { InlineEditor } from "@ckeditor/ckeditor5-editor-inline";

import { Alignment } from "@ckeditor/ckeditor5-alignment";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
} from "@ckeditor/ckeditor5-basic-styles";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import {
  FontSize,
  FontFamily,
  FontColor,
  FontBackgroundColor,
} from "@ckeditor/ckeditor5-font";
import {
  Image,
  ImageStyle,
  ImageToolbar,
  ImageResizeEditing,
  ImageResizeHandles,
} from "@ckeditor/ckeditor5-image";
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
import DocfieldComments from "./plugins/docfield-comments/docfield-comments";
import DocfieldSmartfield from "./plugins/docfield-smartfield/docfield-smartfield";
import "./ckeditor.css";
import { defaultColorsHex } from "./constants";

const plugins = [
  Essentials,
  Alignment,
  Bold,
  FontSize,
  FontFamily,
  FontColor,
  FontBackgroundColor,
  Indent,
  IndentBlock,
  Image,
  ImageStyle,
  ImageToolbar,
  ImageResizeEditing,
  ImageResizeHandles,
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
  DocfieldImageUpload,
  DocfieldSmartfield,
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
      "insertSmartfield",
      "insertSmartfieldLink",
      "imageUpload",
      "|",
      "undo",
      "redo",
    ],
  },
  image: {
    styles: ["alignLeft", "alignRight", "block"],
    toolbar: [
      "imageStyle:alignLeft",
      "imageStyle:block",
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
    tableProperties: {
      colorPicker: {
        format: "hex",
      },
      backgroundColors: defaultColorsHex,
      borderColors: defaultColorsHex,
    },
    tableCellProperties: {
      colorPicker: {
        format: "hex",
      },
      backgroundColors: defaultColorsHex,
      borderColors: defaultColorsHex,
    },
  },
  list: {
    properties: {
      styles: true,
      startIndex: true,
    },
  },
};

InlineEditor.defaultConfig = config;
MultirootEditor.defaultConfig = config;

export default { InlineEditor, MultirootEditor };
