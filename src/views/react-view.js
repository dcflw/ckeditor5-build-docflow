import { View } from "@ckeditor/ckeditor5-ui";
import React from "react";
import ReactDOM from "react-dom";

export default class ReactView extends View {
  constructor(locale, component, props = {}) {
    super(locale);

    this.reactComponent = component;
    this.reactComponentProps = props;

    this.updateProps = this.updateProps.bind(this);
    this.setTemplate({
      tag: "div",
      attributes: {
        class: ["ck", "ck-react-view"],
        style: "min-width: 350px;",
      },
    });
  }

  render() {
    super.render();

    this.renderReactComponent();
  }

  destroy() {
    this.destroyReactComponent();

    super.destroy();
  }

  renderReactComponent() {
    if (this.element) {
      const reactElement = React.createElement(
        this.reactComponent,
        this.reactComponentProps,
      );

      this.destroyReactComponent();
      ReactDOM.render(reactElement, this.element);
    }
  }

  destroyReactComponent() {
    if (this.element) {
      ReactDOM.unmountComponentAtNode(this.element);
    }
  }

  updateProps(props = {}) {
    this.reactComponentProps = {
      ...this.reactComponentProps,
      ...props,
    };

    this.renderReactComponent();
  }
}
