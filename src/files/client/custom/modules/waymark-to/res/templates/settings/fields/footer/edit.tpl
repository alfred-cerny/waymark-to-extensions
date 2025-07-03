<div class="row">
    <div class="col-md-6">
        <label>{{translate 'Edit' category='labels'}}</label>
        <textarea
            class="main-element form-control hidden auto-height"
            data-name="{{name}}"
            {{#if params.maxLength}} maxlength="{{params.maxLength}}"{{/if}}
            rows="{{rows}}"
            style="resize: none;"
        >{{value}}</textarea>
        <div class="summernote hidden"></div>
    </div>
    <div class="col-md-6">
        <label>{{translate 'Preview' category='labels'}}</label>
        <div class="panel panel-default">
            <div class="panel-body">
                <div class="footer-preview" style="min-height: 200px; padding: 20px; background-color: #f5f5f5;">
                    <div class="footer-preview-content">
                        {{{previewHtml}}}
                    </div>
                </div>
            </div>
        </div>
        <div class="small text-muted" style="margin-top: 10px;">
            {{translate 'footerPreviewNote' category='messages' scope='Settings'}}
        </div>
    </div>
</div>