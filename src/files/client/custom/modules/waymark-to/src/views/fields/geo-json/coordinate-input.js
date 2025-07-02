define('waymark-to:views/fields/geo-json/coordinate-input', ['view'], (Dep) => {

    return class extends Dep {
        
        template = 'waymark-to:fields/geo-json/coordinate-input';
        
        data() {
            return {
                lon: this.options.lon || 0,
                lat: this.options.lat || 0,
                alt: this.options.alt || null,
                index: this.options.index || 0,
                allowRemove: this.options.allowRemove !== false,
                allowDrag: this.options.allowDrag !== false,
                coordinateSystem: this.options.coordinateSystem || 'WGS84'
            };
        }
        
        events = {
            'input .lon-input': 'onLonChange',
            'input .lat-input': 'onLatChange',
            'input .alt-input': 'onAltChange',
            'click [data-action="removeCoordinate"]': 'actionRemove'
        };
        
        setup() {
            this.listenTo(this, 'render', () => {
                if (this.options.allowDrag && this.$el.closest('.coordinates-list').length) {
                    this.$el.addClass('sortable-coordinate');
                }
            });
        }
        
        onLonChange(e) {
            const value = parseFloat(e.currentTarget.value);
            if (!isNaN(value)) {
                this.trigger('coordinate-change', {
                    index: this.options.index,
                    lon: value,
                    lat: this.options.lat,
                    alt: this.options.alt
                });
            }
        }
        
        onLatChange(e) {
            const value = parseFloat(e.currentTarget.value);
            if (!isNaN(value)) {
                this.trigger('coordinate-change', {
                    index: this.options.index,
                    lon: this.options.lon,
                    lat: value,
                    alt: this.options.alt
                });
            }
        }
        
        onAltChange(e) {
            const value = e.currentTarget.value;
            const alt = value ? parseFloat(value) : null;
            this.trigger('coordinate-change', {
                index: this.options.index,
                lon: this.options.lon,
                lat: this.options.lat,
                alt: alt
            });
        }
        
        actionRemove() {
            this.trigger('coordinate-remove', this.options.index);
        }
        
        getCoordinateBounds() {
            if (this.options.coordinateSystem === 'WebMercator') {
                return {
                    lonMin: -20037508.34,
                    lonMax: 20037508.34,
                    latMin: -20037508.34,
                    latMax: 20037508.34
                };
            }
            return {
                lonMin: -180,
                lonMax: 180,
                latMin: -90,
                latMax: 90
            };
        }
        
        validate() {
            const bounds = this.getCoordinateBounds();
            const lonValue = this.$el.find('.lon-input').val();
            const latValue = this.$el.find('.lat-input').val();
            const lon = parseFloat(lonValue);
            const lat = parseFloat(latValue);
            
            if (!lonValue || isNaN(lon)) {
                console.error(`[Coordinate ${this.options.index + 1}] Invalid longitude value`);
                return false;
            }
            
            if (lon < bounds.lonMin || lon > bounds.lonMax) {
                console.error(`[Coordinate ${this.options.index + 1}] Longitude ${lon} out of bounds [${bounds.lonMin}, ${bounds.lonMax}]`);
                return false;
            }
            
            if (!latValue || isNaN(lat)) {
                console.error(`[Coordinate ${this.options.index + 1}] Invalid latitude value`);
                return false;
            }
            
            if (lat < bounds.latMin || lat > bounds.latMax) {
                console.error(`[Coordinate ${this.options.index + 1}] Latitude ${lat} out of bounds [${bounds.latMin}, ${bounds.latMax}]`);
                return false;
            }
            
            return true;
        }
    };
});