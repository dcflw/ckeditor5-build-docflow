# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.0.0] - 2024-02-20

### Removed

Unused plugins `DocfieldLink` and `DocfieldPlaceholder` were removed.

## [4.0.0] - 2023-12-20

### Changed

- The custom paste sanitizer was removed, which leads to CKEditor not removing colors from pasted text by default. If you don't want to allow colored text, add plugins `"FontColor"` and `"FontBackgroundColor"` to the `removePlugins` config option.

## [3.0.0] - 2023-10-05

Nothing changed, this release was rolled back.

## [2.0.0] - 2023-09-13

### Changed

- Changed the custom properties of CKEditor's config from `docflow*` to `docfield*`
  Affected properties: `docflowImageUpload`, `docflowPlaceholder`, `docflowSmartfield`

[5.0.0]: https://github.com/dcflw/ckeditor5-build-docflow/releases/tag/v5.0.0
[4.0.0]: https://github.com/dcflw/ckeditor5-build-docflow/releases/tag/v4.0.0
[3.0.0]: https://github.com/dcflw/ckeditor5-build-docflow/releases/tag/v3.0.0
[2.0.0]: https://github.com/dcflw/ckeditor5-build-docflow/releases/tag/v2.0.0
