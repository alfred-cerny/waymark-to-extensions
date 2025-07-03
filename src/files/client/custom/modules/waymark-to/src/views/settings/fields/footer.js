define('waymark-to:views/settings/fields/footer', ['views/fields/wysiwyg'], Dep => {
    return class extends Dep {

        editTemplate = 'waymark-to:settings/fields/footer/edit';

        defaultFooterContent = '<p>&copy; {year} <a href="https://www.espocrm.com" title="Powered by EspoCRM" rel="noopener" target="_blank">EspoCRM</a></p>';

        setup() {
            super.setup();

            if (!this.model.get(this.name)) {
                this.model.set(this.name, this.defaultFooterContent);
            }

            this.validations.push('espoCrmCredits');

            this.listenTo(this.model, 'change:' + this.name, () => {
                this.updatePreview();
            });
        }

        data() {
            const data = super.data();

            let content = this.model.get(this.name) || '';
            content = content.replace(/\{year}/g, new Date().getFullYear()?.toString());
            data.previewHtml = content;

            return data;
        }

        afterRender() {
            super.afterRender();

            if (this.isEditMode()) {
                this.once('ckeditor-ready', () => {
                    if (this.ckeditor) {
                        this.ckeditor.on('change', () => {
                            this.updatePreview();
                        });
                    }
                });
            }
        }

        updatePreview() {
            let content = this.ckeditor ? this.ckeditor.getData() : (this.model.get(this.name) || '');
            content = content.replace(/\{year}/g, new Date().getFullYear()?.toString());
            
            const $preview = this.$el.find('.footer-preview-content');

            if ($preview.length) {
                $preview.html(content);
            }
        }

        validateEspoCrmCredits() {
            const value = this.model.get(this.name) || '';

            const regex = />.*?espocrm.*?</i;
            if (!regex.test(value)) {
                const msg = this.translate('footerValidation', 'messages', 'Settings') ||
                           'Footer content must contain a link to EspoCRM (>EspoCRM<)';
                this.showValidationMessage(msg);
                return true;
            }

            return false;
        }
    };
});