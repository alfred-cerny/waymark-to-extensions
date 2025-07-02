define('waymark-to:views/fields/geo-json/property-input', ['view'], (Dep) => {

    return class extends Dep {
        
        template = 'waymark-to:fields/geo-json/property-input';
        
        data() {
            return {
                key: this.options.key || '',
                value: this.options.value || '',
                index: this.options.index || 0
            };
        }
        
        events = {
            'input .property-key': 'onKeyChange',
            'input .property-value': 'onValueChange',
            'click [data-action="removeProperty"]': 'actionRemove'
        };
        
        onKeyChange(e) {
            const oldKey = this.options.key;
            const newKey = e.currentTarget.value;
            
            this.trigger('property-change', {
                index: this.options.index,
                oldKey: oldKey,
                key: newKey,
                value: this.options.value
            });
        }
        
        onValueChange(e) {
            const value = e.currentTarget.value;
            
            this.trigger('property-change', {
                index: this.options.index,
                key: this.options.key,
                value: value
            });
        }
        
        actionRemove() {
            this.trigger('property-remove', {
                index: this.options.index,
                key: this.options.key
            });
        }
        
        validate() {
            const key = this.$el.find('.property-key').val();
            
            if (!key || !key.trim()) {
                return false;
            }
            
            return true;
        }
    };
});