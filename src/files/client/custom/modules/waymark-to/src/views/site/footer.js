define('waymark-to:views/site/footer', ['views/site/footer'], Dep => {
    return class extends Dep {

        template = 'waymark-to:site/footer';

        setup() {
            super.setup();
            
            const footerContent = this.getConfig().get('footer') || '';
            this.footerContent = footerContent.replace(/\{year}/g, new Date().getFullYear()?.toString());
        }

        data() {
            const data = super.data();
            
            data.footerContent = this.footerContent;
            data.hasFooterContent = !!this.footerContent;
            
            return data;
        }
    };
});