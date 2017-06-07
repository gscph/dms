//delete 
(function ($) {
    $(document).on("enableBulkDelete", function (eventContext, buttonValidation) {
        $(document).bind('DOMNodeInserted', function (evt) {
            if ($(evt.target).hasClass('view-toolbar grid-actions')) {

                var classes = 'btn btn-primary delete';
                var icon = DMS.Helpers.CreateGlyphIcon('glyphicon-trash');
                var confirmation = DMS.Helpers.CreateDeleteConfirmation();

                $('section.content-header').append(confirmation);

                var button = DMS.Helpers.CreateButton('button', classes, '', ' DELETE', icon);

                var recordArr = [];


                button.on('click', function () {
                    recordArr = getSelectedRecords();

                    if (recordArr.length > 0) {
                        confirmation.modal('show');


                        confirmation.find('.deleteModal').on('click', function () {
                            var _layouts = $('.entity-grid.entitylist').data("view-layouts");
                            var logicalName = _layouts[0].Configuration.EntityName;
                            DeleteRecords(recordArr, $(this), logicalName, buttonValidation);

                            console.log(recordArr);
                        });
                        return;
                    }

                    DMS.Notification.Error('Please select a record first');
                });

                $(evt.target).append(button);
            }
        });
    });


    $(document).on("enableSubGridBulkDelete", function (evt, subgridId) {
        $(document).bind('DOMNodeInserted', function (evt) {
            var isSubGridFrm = $(evt.target).parent().parent(subgridId + '.subgrid').html();

            if (typeof isSubGridFrm !== 'undefined' && $(evt.target).hasClass('view-toolbar grid-actions')) {
                var button = CreateDeleteButton();
                $(evt.target).append(button);
            }
        });
    });

    var DeleteRecords = function (records, modalButton, logicalName, buttonValidation) {

        var recordArrLength = records.length;

        var recordArr = records;


        recordArr = buttonValidation.run(records);


        var somethingWasRemoved = recordArrLength == recordArr.length;
        var howMany = recordArrLength - recordArr.length;


        if (recordArr.length <= 0) {
            DMS.Notification.Error('You are unauthorized to modify this record.');
            return;
        }

        var html = modalButton.html();
        modalButton.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;DELETING..');
        modalButton.addClass('disabled');
        modalButton.siblings('.btn').addClass('disabled');

        var json = DMS.Helpers.CreateModelWithoutFieldUpdate(records, logicalName);

        var url = "/api/EditableGrid/DeleteRecords";

        var service = Service('DELETE', url, json, DMS.Helpers.DefaultErrorHandler);

        service.then(function () {

            DMS.Notification.Success(recordArr.length + " Record(s) Deleted!", true, 4000);
            DMS.Helpers.RefreshEntityList(',prospect');
            if (!somethingWasRemoved) {
                setTimeout(function () {
                    DMS.Notification.Error(howMany + ' Record(s) were not deleted (Unauthorized).', true, 5000);
                }, 4000);
            }        

        }).always(function () {
            modalButton.html(html);
            modalButton.removeClass('disabled');
            modalButton.siblings('.btn').removeClass('disabled');
            $('.view-toolbar.grid-actions .activate').addClass('disabled');
            $('.view-toolbar.grid-actions .deactivate').addClass('disabled');
            $('.modal-delete').modal('hide');
            $('td[data-attribute="gsc_reportsto"').hide();
        });
    }

})(jQuery);

//activate //deactivate
$(document).on("enableActivateDeactivate", function (event, buttonValidation) {

    var classes = 'btn btn-primary action disabled add-margin-right';

    // create string icon = <i class="fa fa-check-cricle"><i/> ACTIVATE
    var activateIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-check-circle');
    // create string icon = <i class="fa fa-times-cricle"><i/> DEACTIVATE
    var deactivateIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-times-circle');

    var activateButton = DMS.Helpers.CreateButton('button', classes, '', ' ACTIVATE', activateIcon);
    var deActivateButton = DMS.Helpers.CreateButton('button', classes, '', ' DEACTIVATE', deactivateIcon);

    activateButton.on('click', function (evt) {
        var recordArr = [];
        recordArr = getSelectedRecords();

        UpdateStatus(recordArr, "enable", $(this), deActivateButton, buttonValidation);
    });

    activateButton.addClass('activate');

    deActivateButton.on('click', function (evt) {
        var recordArr = [];
        recordArr = getSelectedRecords();

        UpdateStatus(recordArr, "disable", $(this), activateButton, buttonValidation);
    });

    deActivateButton.addClass('deactivate');

    $(document).bind('DOMNodeInserted', function (evt) {

        if ($(evt.target).hasClass('view-toolbar grid-actions')) {
            $(evt.target).append(activateButton);
            $(evt.target).append(deActivateButton);

            $(document).on("click", ".entity-grid.entitylist .view-grid table tbody tr", ClickEvent);

        }


    });

    function ClickEvent(evt) {
        var recordArr = [];
        recordArr = getSelectedRecords();

        var element = $(this);

        activateButton.removeClass('disabled');
        deActivateButton.removeClass('disabled');

        if (recordArr.length == 0) {
            activateButton.addClass('disabled');
            deActivateButton.addClass('disabled');
        }
    }

});



function UpdateStatus(records, status, button, sibling, buttonValidation) {

    var recordArrLength = records.length;

    var recordArr = records;


    recordArr = buttonValidation.run(records);


    var somethingWasRemoved = recordArrLength == recordArr.length;
    var howMany = recordArrLength - recordArr.length;

    if (recordArr.length <= 0) {
        DMS.Notification.Error('You are unauthorized to modify this record.');
        return;
    }   

    var html = button.html();
    var logicalName =$('.entity-grid.entitylist').data("view-layouts")[0].Configuration.EntityName;

    button.addClass('disabled');
    button.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;PROCESSING..');
    sibling.addClass('disabled');

    var json = DMS.Helpers.CreateModel(records, logicalName, { Value: status });

    var url = "/api/Service/UpdateEntityStatus";

    var service = Service('PUT', url, json, DMS.Helpers.DefaultErrorHandler);

    service.then(function () {

        DMS.Notification.Success(recordArr.length + " Record(s) Updated!", true, 4000);
        DMS.Helpers.RefreshEntityList(',prospect');
        if (!somethingWasRemoved) {
            setTimeout(function () {
                DMS.Notification.Error(howMany + ' Record(s) were not saved (Unauthorized).', true, 5000);
            }, 4000);
        }      
    }).always(function () {
        button.html(html);      
    });



}



