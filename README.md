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

## Publish the package to NPM
Login to npm:
```sh
npm login
```

Publish the package:
```sh
npm publish
```
