# CKEditor 5 build for Docflow

Based on the [Classic Editor](https://github.com/ckeditor/ckeditor5-editor-classic).

## Prerequisites

Retrieve all dependencies with yarn:

```sh
yarn install
```

## Usage

Build for production use:

```sh
yarn build
```

And run the sample website `sample/index.html`.

## Use the package (locally) without publishing to NPM
Install [yalc](https://www.npmjs.com/package/yalc):
```sh
npm i yalc -g
```

Publish the package to the local repository:
```sh
yalc publish
```

Go to the project folder where you want to use the package and run:
```sh
yalc link @docflow/ckeditor5-build-docflow
```

## Publish the package to NPM
Login to npm:
```sh
npm login
```

Publish the package:
```sh
npm publish
```
