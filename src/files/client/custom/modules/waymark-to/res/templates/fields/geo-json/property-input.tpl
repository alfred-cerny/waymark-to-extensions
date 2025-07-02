<div class="property-item row" data-index="{{index}}">
    <div class="col-xs-5">
        <div class="form-group">
            <input type="text" 
                   class="form-control property-key" 
                   value="{{key}}" 
                   placeholder="{{translate 'Property Name' scope='Global'}}">
        </div>
    </div>
    
    <div class="col-xs-5">
        <div class="form-group">
            <input type="text" 
                   class="form-control property-value" 
                   value="{{value}}" 
                   placeholder="{{translate 'Value' scope='Global'}}">
        </div>
    </div>
    
    <div class="col-xs-2">
        <div class="form-group">
            <button type="button" 
                    class="btn btn-danger btn-sm btn-block" 
                    data-action="removeProperty">
                <span class="fas fa-minus"></span>
            </button>
        </div>
    </div>
</div>