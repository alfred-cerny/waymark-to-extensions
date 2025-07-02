<div class="coordinate-item row" data-index="{{index}}">
    {{#if allowDrag}}
    <div class="col-xs-1">
        <div class="coordinate-controls">
            <span class="drag-handle" style="cursor: move;" title="{{translate 'Drag to reorder' scope='Global'}}">
                <span class="fas fa-grip-vertical"></span>
            </span>
        </div>
    </div>
    {{/if}}
    
    <div class="{{#if allowDrag}}col-xs-3{{else}}col-xs-4{{/if}}">
        <div class="form-group">
            <input type="number" 
                   class="form-control lon-input" 
                   value="{{lon}}" 
                   step="0.000001" 
                   placeholder="Longitude"
                   title="{{translate 'Longitude' scope='Global'}}">
        </div>
    </div>
    
    <div class="{{#if allowDrag}}col-xs-3{{else}}col-xs-4{{/if}}">
        <div class="form-group">
            <input type="number" 
                   class="form-control lat-input" 
                   value="{{lat}}" 
                   step="0.000001" 
                   placeholder="Latitude"
                   title="{{translate 'Latitude' scope='Global'}}">
        </div>
    </div>
    
    <div class="{{#if allowDrag}}col-xs-3{{else}}col-xs-4{{/if}}">
        <div class="form-group">
            <input type="number" 
                   class="form-control alt-input" 
                   value="{{alt}}" 
                   step="0.1"
                   placeholder="Altitude"
                   title="{{translate 'Altitude (optional)' scope='Global'}}">
        </div>
    </div>
    
    {{#if allowRemove}}
    <div class="col-xs-2">
        <div class="form-group">
            <button type="button" class="btn btn-danger btn-sm" data-action="removeCoordinate">
                <span class="fas fa-minus"></span>
            </button>
        </div>
    </div>
    {{/if}}
</div>