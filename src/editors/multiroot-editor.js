import { Editor, DataApiMixin } from "@ckeditor/ckeditor5-core";
import { HtmlDataProcessor } from "@ckeditor/ckeditor5-engine";
import {
  getDataFromElement,
  setDataInElement,
  mix,
} from "@ckeditor/ckeditor5-utils";

import MultirootEditorUI from "./multiroot-editor-ui";
import MultirootEditorUIView from "./multiroot-editor-ui-view";

/**
 * The multi-root editor implementation. It provides inline editables and a single toolbar.
 *
 * Unlike other editors, the toolbar is not rendered automatically and needs to be attached to the DOM manually.
 *
 * This type of an editor is dedicated to integrations which require a customized UI with an open
 * structure, allowing developers to specify the exact location of the interface.
 */
class MultirootEditor extends Editor {
  /**
   * Creates an instance of the multi-root editor.
   *
   * **Note:** Do not use the constructor to create editor instances. Use the static `MultirootEditor.create()` method instead.
   *
   * @protected
   * @param {Object.<String,HTMLElement>} sourceElements The list of DOM elements that will be the source
   * for the created editor (on which the editor will be initialized).
   * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
   */
  constructor(sourceElements, config) {
    super(config);

    this.data.processor = new HtmlDataProcessor(this.data.viewDocument);

    // Create root and UIView element for each editable container.
    for (const rootName of Object.keys(sourceElements)) {
      this.model.document.createRoot("$root", rootName);
    }

    this.ui = new MultirootEditorUI(
      this,
      new MultirootEditorUIView(this.locale, this.editing.view, sourceElements),
    );
  }

  /**
   * @inheritDoc
   */
  destroy() {
    // Cache the data and editable DOM elements, then destroy.
    // It's safe to assume that the model->view conversion will not work after super.destroy(),
    // same as `ui.getEditableElement()` method will not return editables.
    const data = {};
    const editables = {};
    const editablesNames = Array.from(this.ui.getEditableElementsNames());

    for (const rootName of editablesNames) {
      data[rootName] = this.getData({ rootName });
      editables[rootName] = this.ui.getEditableElement(rootName);
    }

    this.ui.destroy();

    return super.destroy().then(() => {
      for (const rootName of editablesNames) {
        setDataInElement(editables[rootName], data[rootName]);
      }
    });
  }

  addRoot(rootName, sourceElement) {
    const data = getDataFromElement(sourceElement);

    this.model.document.createRoot("$root", rootName);
    this.ui.createEditableView(rootName, sourceElement);
    this.model.enqueueChange("transparent", (writer) => {
      const modelRoot = this.model.document.getRoot(rootName);

      writer.remove(writer.createRangeIn(modelRoot));
      writer.insert(this.data.parse(data, modelRoot), modelRoot, 0);
    });
  }

  removeRoot(rootName) {
    const data = this.getData({ rootName });
    const editableElement = this.ui.getEditableElement(rootName);

    this.ui.removeEditableView(rootName);
    this.model.document.roots.remove(rootName);

    setDataInElement(editableElement, data);
  }

  setPlaceholder(rootName, placeholderText) {
    this.ui.setPlaceholder(rootName, placeholderText);
  }

  /**
   * Creates a multi-root editor instance.
   *
   * @param {Object.<String,HTMLElement>} sourceElements The list of DOM elements that will be the source
   * for the created editor (on which the editor will be initialized).
   * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
   * @returns {Promise<MultirootEditor>} A promise resolved once the editor is ready.
   */
  static create(sourceElements, config) {
    return new Promise((resolve) => {
      const editor = new this(sourceElements, config);

      resolve(
        editor
          .initPlugins()
          .then(() => editor.ui.init())
          .then(() => {
            const initialData = {};

            // Create initial data object containing data from all roots.
            for (const rootName of Object.keys(sourceElements)) {
              initialData[rootName] = getDataFromElement(
                sourceElements[rootName],
              );
            }

            return editor.data.init(initialData);
          })
          .then(() => editor.fire("ready"))
          .then(() => editor),
      );
    });
  }
}

mix(MultirootEditor, DataApiMixin);

export default MultirootEditor;
