(function ($) {
    $(document).on("enableBulkDelete", function () {
        $(document).bind('DOMNodeInserted', function (evt) {
            if ($(evt.target).hasClass('view-toolbar grid-actions')) {
                // create delete button
                var classes = 'btn btn-primary delete';
                var icon = DMS.Helpers.CreateFontAwesomeIcon('fa-minus');
                var confirmation = DMS.Helpers.CreateDeleteConfirmation();

                $('section.content-header').append(confirmation);

                var button = DMS.Helpers.CreateAnchorButton(classes, '', ' DELETE', icon);

                var recordArr = [];

                button.on('click', function () {
                    // get row id values (returns array of guid as string in js)
                    recordArr = getSelectedRecords();
                   
                    if (recordArr.length > 0) {
                        // show confirmation
                        confirmation.modal('show');
                        // hook click event
                        confirmation.find('.deleteModal').on('click', function () {
                            // get layout config from adx
                            var _layouts = $('.entity-grid.entitylist').data("view-layouts");
                            var logicalName = _layouts[0].Configuration.EntityName

                            DeleteRecords(recordArr, $(this), logicalName);                           
                        });
                        return;
                    }

                    DMS.Notification.Error('Please select a record first', true, 5000);
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

    var DeleteRecords = function (recordArr, modalButton, logicalName) {      

        var html = modalButton.html();
        modalButton.html('<i class="fa-minus" style="color: #334a5e;"></i>&nbsp;DELETING..');
        //modalButton.html('<span class="icon-delete-button-01">
        //        <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span>
        //        </span>"></i>&nbsp;DELETING..');
        modalButton.addClass('disabled');
        modalButton.siblings('.btn').addClass('disabled');

        recordArr = globalRecordValidator(recordArr);
        if (recordArr.length <= 0) {
            HideModal(modalButton, html);
            DMS.Notification.Error('You are unauthorized to delete this record.');
            return false;
        }

        var json = DMS.Helpers.CreateModelWithoutFieldUpdate(recordArr, logicalName);                  
     
        var url = "/api/EditableGrid/DeleteRecords";

        var service = Service('DELETE', url, json, DMS.Helpers.DefaultErrorHandler);

        service.then(function () {
            setTimeout(function () {
                recordArr.forEach(function (item, index) {
                    $('tr[data-id=' + item + ']').remove();
                });
                DMS.Notification.Success('Record(s) Successfully Deleted!', true, 5000);
                $('.entity-grid.entitylist').trigger('refresh');
            }, 100);
        }).always(function () {
            HideModal(modalButton, html);
        });
    }

    function HideModal(modalButton, html)
    {
        modalButton.html(html);
        modalButton.removeClass('disabled');
        modalButton.siblings('.btn').removeClass('disabled');
        $('.view-toolbar.grid-actions .activate').addClass('disabled');
        $('.view-toolbar.grid-actions .deactivate').addClass('disabled');
        $('.modal-delete').modal('hide');
    }

    function globalRecordValidator(records) {
        if (DMS.Settings.Permission.DeleteScope == 756150000) {
            records.forEach(function (value, index) {
                var $tr = $('tr[data-id=' + value + ']');
                var tdGlobalRecord = $tr.find('td[data-attribute="gsc_isglobalrecord"]');

                if (typeof tdGlobalRecord !== 'undefined') {
                    if (tdGlobalRecord.data('value') == true) {
                        records.splice(index, 1);
                        return true;
                    }
                }

                if (DMS.Settings.Permission.DeleteScope == 756150002) {
                    var tdBranchId = $tr.find('td[data-attribute="gsc_branchid"]');
                    if (typeof tdBranchId !== 'undefined') {
                        var value = tdBranchId.data('value');
                        if (value !== "undefined" && value != null) {
                            if (value.Id != DMS.Settings.User.branchId)
                                records.splice(index, 1);
                        }
                        return true;
                    }
                }
                else if (DMS.Settings.Permission.DeleteScope == 756150001) {
                    var tdOwnerId = $tr.find('td[data-attribute="gsc_recordownerid"]');
                    if (typeof tdOwnerId !== 'undefined') {
                        var value = tdOwnerId.data('value');
                        if (value !== "undefined" && value != null) {
                            if (value.Id != DMS.Settings.User.Id)
                                records.splice(index, 1);
                        }
                        return true;
                    }
                }
            });
        }
        return records;
    }

})(jQuery);