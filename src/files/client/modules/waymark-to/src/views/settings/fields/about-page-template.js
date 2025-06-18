define(['views/fields/wysiwyg'], Dep => {
	return class extends Dep {

		editTemplate = 'waymark-to:settings/fields/about-page-template/edit';

		defaultTemplateContent = `
			<div class="page-header">
				<h3>{{translate 'About'}}</h3>
			</div>
			
			<div class="row">
				<div class="col-md-8">
					<div class="panel panel-default">
						<div class="panel-body">
							<p>
								<span class="text-bold text-soft">Version {{version}}</span>
							</p>
						</div>
			
					</div>
					<div class="panel panel-default">
						<div class="panel-body">
							<div class="complex-text">
								{{text}}
							</div>
						</div>
					</div>
			
				</div>
			</div>
		`;

		setup() {
			super.setup();

			if (!this.model.get(this.name)) {
				this.model.set(this.name, this.defaultTemplateContent);
			}

			this.listenTo(this.model, 'change:aboutPageText change:' + this.name, () => {
				this.refreshPreview();
			});
			
			this.refreshPreview();
		}

		refreshPreview() {
			this.createView('htmlPreview', 'views/about', {
				el: this.getSelector() + ' .html-preview',
				templateContent: this.model.get(this.name) || this.defaultTemplateContent,
				version: this.getConfig().get('version') || '',
				text: this.model.get('aboutPageText') || ''
			}, view => {
				view.render();
			});
		}
	};
});
