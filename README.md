# CKEditor 5 build for Docflow

Based on the [Classic Editor](https://github.com/ckeditor/ckeditor5-editor-classic).

## Publishing workflow

This package auto-deploys every push to `master`. Use the Conventional Commits format for versioning:

* A commit that starts with `feat` will trigger a minor version bump
* A commit that includes `BREAKING CHANGE` in the body will trigger a major version bump
* Any other commit will be a patch version bump

## Usage

Build for production use:

```sh
yarn build
```

And run the sample website `sample/index.html`.

## Use the package (locally) without publishing to NPM
### Link package using yalc
Install [yalc](https://www.npmjs.com/package/yalc):
```sh
npm i yalc -g
```

Build and publish the package to the local repository:
```sh
yarn build && yalc publish
```

Go to the project folder where you want to use the package and run:
```sh
yalc link @docflow/ckeditor5-build-docflow
```
### Update linked package
Build and publish the package to the local repository:
```sh
yarn build && yalc publish
```
Go to the project folder where you are using the package and run:
```sh
yalc update
```
