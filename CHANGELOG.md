# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] - 2023-10-05

### Changed

- The property of the multi-root editor on the default export object has been changed from `MultirootEditor` to `MultiRootEditor`
- Adding and deleting roots of a multi-root has a new API, which is documented by CKEditor. Note that methods `addRoot` and `detachRoot` return promises to the "root element", unlike CKEditor's API, where you need to get them through events. Here are the differences between the old and new multi-root editor API:
  - You no longer explicitly create a DOM node to mount the editor in (using `document.createElement`), instead you create it using CKEditor's API.
  - When you call `editor.addRoot`, instead of the DOM node as a second argument you pass a config object that may contain initial data (`{ data }`).
  - As a result of `addRoot`, you get a promise that resolves to a "root element", an internal CKEditor thing that you can then pass to `editor.createEditable` with an optional placeholder for the new root (`editor.createEditable(rootElement, placeholder)`). `createEditable` then returns the DOM node that you can attach wherever you want.
  - Similarly, with `detachRoot`, when you call it, you get a promise that resolves to a "root element" that you then pass to `editor.detachEditable`, which returns a DOM node for you to detach.


## [2.0.0] - 2023-09-13

### Changed

- Changed the custom properties of CKEditor's config from `docflow*` to `docfield*`
  Affected properties: `docflowImageUpload`, `docflowPlaceholder`, `docflowSmartfield`

[unreleased]: https://github.com/dcflw/ckeditor5-build-docflow/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/dcflw/ckeditor5-build-docflow/releases/tag/v2.0.0
