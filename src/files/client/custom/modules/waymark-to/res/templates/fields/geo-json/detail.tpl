<div class="geo-json-detail-container">
    {{#if summary}}
    <div class="geo-json-summary">
        <div class="row">
            <div class="col-xs-12">
                <strong>
                    <span class="fas fa-map-marker-alt text-primary"></span>
                    {{translate summary.type scope='Global'}}
                </strong>
                
                {{#if summary.count}}
                <span class="badge">{{summary.count}}</span>
                {{/if}}
                
                {{#if summary.geometryType}}
                <small class="text-muted">
                    ({{translate summary.geometryType scope='Global'}})
                </small>
                {{/if}}
                
                {{#if summary.coordinateCount}}
                <small class="text-muted">
                    • {{summary.coordinateCount}} {{translate 'coordinates' scope='Global'}}
                </small>
                {{/if}}
            </div>
        </div>
    </div>
    {{/if}}
    
    {{#if formattedValue}}
    <div class="geo-json-formatted" style="margin-top: 10px;">
        <details>
            <summary style="cursor: pointer;">
                <small class="text-muted">
                    <span class="fas fa-code"></span>
                    {{translate 'View JSON' scope='Global'}}
                </small>
            </summary>
            <pre class="geo-json-code" style="max-height: 300px; overflow-y: auto; font-size: 11px; margin-top: 10px; background: #f8f9fa; padding: 10px; border: 1px solid #e9ecef; border-radius: 3px;"><code>{{formattedValue}}</code></pre>
        </details>
    </div>
    {{/if}}
    
    {{#unless summary}}
    <div class="text-muted">
        <em>{{translate 'No GeoJSON data' scope='Global'}}</em>
    </div>
    {{/unless}}
</div>