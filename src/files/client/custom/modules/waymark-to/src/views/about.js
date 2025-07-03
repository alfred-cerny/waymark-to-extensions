extend((Dep) => {

	return class extends Dep {
		template = false;

		setup() {
			this.text = this.options?.text;
			this.version = this.options?.version;

			if (!this.text) {
				this.wait(
					Espo.Ajax.getRequest('App/about')
						.then(data => {
							this.text = data.text;
							this.version = this.version || data.version;
						})
				);
			}
			const templateContent = this.options?.templateContent || this.getConfig().get('aboutPageTemplate') || undefined;
			if (templateContent) {
				this.template = false;
				this.templateContent = templateContent;
			} else {
				this.template = 'about';
			}
		}

	};
});