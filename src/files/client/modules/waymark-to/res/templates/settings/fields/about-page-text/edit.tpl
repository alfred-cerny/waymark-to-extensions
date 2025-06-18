<div class="row">
    <div class="col-md-6">
        <label>{{translate 'Edit' category='labels'}}</label>
        <textarea
            class="main-element form-control auto-height"
            data-name="{{name}}"
            {{#if params.maxLength}}maxlength="{{params.maxLength}}"{{/if}}
            rows="{{rows}}"
            autocomplete="espo-{{name}}"
            style="resize: vertical;"
        >{{value}}
        </textarea>
    </div>
    <div class="col-md-6">
        <label>{{translate 'Preview' category='labels'}}</label>
        <div class="panel panel-default">
            <div class="panel-body">
                <div class="markdown-preview complex-text" style="min-height: 400px;">
                    {{{markdownPreview}}}
                </div>
            </div>
        </div>
    </div>
</div>