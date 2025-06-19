define(['views/fields/text'], Dep => {
	return class extends Dep {

		editTemplate = 'waymark-to:settings/fields/about-page-text/edit';

		setup() {
			super.setup();

			this.listenTo(this.model, 'change:' + this.name, () => {
				this.updatePreview();
			});

			if (!this.model.get(this.name)) {
				this.fetchCurrentAboutText();
			}
		}

		data() {
			const data = super.data();

			const text = this.model.get(this.name) || '';
			data.markdownPreview = this.getHelper().transformMarkdownText(text);

			return data;
		}

		updatePreview() {
			const $textarea = this.$el.find('textarea.main-element');
			const text = $textarea.val() || '';
			const html = this.getHelper().transformMarkdownText(text);

			this.$el.find('.markdown-preview').html(html);
			this.reRender();
		}

		fetchCurrentAboutText() {
			Espo.Ajax.getRequest('App/about').then(response => {
				if (response.text && !this.model.get(this.name)) {
					this.model.set(this.name, response.text);
					this.reRender();
				}
			});
		}
	};
});