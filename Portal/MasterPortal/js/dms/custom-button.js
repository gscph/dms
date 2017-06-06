$(document).on("enableClaims", function (event, fieldsIncluded) {
    $(document).bind('DOMNodeInserted', function (evt) {
        if ($(evt.target).hasClass('view-toolbar grid-actions')) {
            var classes = 'btn btn-primary';
            var icon = DMS.Helpers.CreateFontAwesomeIcon('fa-ticket');         
            var button = DMS.Helpers.CreateButton('button', classes, '', ' CLAIM', icon);

            var recordArr = [];
            // button is click
            button.click(function () {
                // button object
                var that = $(this);
                // button text
                var html = that.html();
                // get row values
                recordArr = GetModelForSelectedRecords(fieldsIncluded);
                // are there selected records?
                if (recordArr.length > 0) {
                    //disable button
                    that.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;PROCESSING..');
                    that.addClass('disabled');

                    var url = "/api/EditableGrid/UpdateRecords";
                    var json = JSON.stringify(recordArr);
                    var service = Service('PUT', url, json, DMS.Helpers.DefaultErrorHandler);

                    service.then(function () {
                        DMS.Helpers.RefreshEntityList();
                        DMS.Notification.Success('Valid records were claimed!', 5000);
                    });

                    return;
                }
                DMS.Notification.Error('Please select Approved and Unclaimed record.');
            });

            $(evt.target).append(button);
        }
    });


    function GetModelForSelectedRecords(fields) {
        var result = [];

        var arr = { Id: null, Entity: null, Records: [] };
        // get configuration from adx layout config.
        var _layouts = $('.entitylist[data-view-layouts]').data("view-layouts");

        // get current entity's name
        arr.Entity = _layouts[0].Configuration.EntityName;
        
        // iterate to each row
        $('.entity-grid .view-grid table tbody tr').each(function () {
            var that = $(this);
            // get row selected indicator
            var isRowSelected = that.find('td:first').data('checked');
            // get record status 
            var status = that.find('td[data-attribute="gsc_status"]').data('value');
            // get record claim status
            var claimed = that.find('td[data-attribute="gsc_claimed"]').data('value');
         
            // row is checked and status is not empty?
            if (isRowSelected == "true" && typeof status !== 'undefined') {
                // check if status is approved or if record is already claimed
                if (status.Value != 100000002 || claimed == true) return;
                //get record Id
                arr.Id = that.data('id');
                // create a model from attributes in the row.
                that.find('td:not(:first)').each(function () {
                    var _this = $(this);
                    var row = {
                        Attr: _this.data('attribute'),
                        Value: null,
                        Type: _this.data('type')
                    }
                    //returns -1 if attribute is not found. if found, returns the index of the attribute
                    var index = DMS.Helpers.ContainsInKey(fields, row.Attr);
                    
                    // checks if the field is in included in the parameter
                    if (index != -1) {
                        row.Value = fields[index].value;
                        arr.Records.push(row);                        
                    }                  
                });

                result.push(arr);
            }           
        });

        return result;
    }
});



