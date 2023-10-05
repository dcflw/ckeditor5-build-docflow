# CKEditor 5 build for Docfield

Based on the [Classic Editor](https://github.com/ckeditor/ckeditor5-editor-classic).

## Publishing workflow

This package auto-deploys every push to `master`. Use the Conventional Commits format for versioning:

- A commit that starts with `feat` will trigger a minor version bump
- A commit that includes `BREAKING CHANGE` in the body will trigger a major version bump
- Any other commit will be a patch version bump

## Usage

Build for production use:

```sh
pnpm build
```

And run the sample website `sample/index.html`.
