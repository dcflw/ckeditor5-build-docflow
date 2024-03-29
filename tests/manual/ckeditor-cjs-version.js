/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env commonjs */

const ClassicEditor = require("../../build/ckeditor");

ClassicEditor.create(document.querySelector("#editor"))
  .then((editor) => {
    window.editor = editor;
  })
  .catch((err) => {
    console.error(err.stack);
  });
