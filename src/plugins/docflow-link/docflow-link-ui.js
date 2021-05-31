import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import linkIcon from "./theme/icons/link-icon.svg";

export default class DocflowLinkUI extends Plugin {
	init() {
		const editor = this.editor;
		console.log(editor);
		this.addToolbarButton();
	}

	addToolbarButton() {
		this.editor.ui.componentFactory.add("docflowLink", locale => {
			const dropdownView = createDropdown(locale);

			dropdownView.buttonView.set({
				label: "Link",
				icon: linkIcon,
				tooltip: true,
			});
			
			const items = new Collection();

			items.add({
				type: 'button',
				model: new Model({
					id: 'internal-link',
					withText: true,
					label: 'Internal link'
				})
			});
			items.add({
				type: 'button',
				model: new Model({
					id: 'external-link',
					withText: true,
					label: 'External link'
				})
			});

			addListToDropdown(dropdownView, items);
			//this.listenTo(button, "execute", () => this.showBalloon());

			this.listenTo(dropdownView, 'execute', evt => {
				const { id } = evt.source;
				if (id === 'internal-link') {
					console.log("internal link");
				} else if (id === 'external-link') {
					const externalLinkPlugin = this.editor.plugins.get("LinkUI");
					externalLinkPlugin._showUI(true);
				}
			});

			return dropdownView;
		});
	}
}