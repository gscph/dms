
(function ($) {
    //Retrieve Reporting To contacts
    var customValidator = {
        run: function (records) {
            var userId = DMS.Settings.User.Id;
            var oDataUrl = '/_odata/employee?$filter=gsc_reportsto/Id%20eq%20(Guid%27' + userId + '%27)&';
            return $.ajax({
                type: 'get',
                async: false,
                url: oDataUrl,
                error: function (xhr, textStatus, errorMessage) {
                    console.error(errorMessage);
                }
            });
        }
    };

    function applySupervisorValidator(data, records){
        var recordArrLength = records.length;
        var recordArr = records;

        records.forEach(function (value, index) {
            var tdReportsTo, reportsTo, createdBy, tdCreatedBy, tdAge, tdSalesExecutive, salesExecutive;
            var $tr = $('tr[data-id="' + value + '"]');
              
            tdCreatedBy = $tr.find('td[data-attribute="gsc_recordownerid"]').data('value');
            tdSalesExecutive = $tr.find('td[data-attribute="gsc_salesexecutiveid"]').data('value');
            tdAge = $tr.find('td[data-attribute="gsc_age"]');

            if (typeof tdCreatedBy !== 'undefined') {
                createdBy = tdCreatedBy.Id;
            }
            if (typeof tdSalesExecutive !== 'undefined') {
                salesExecutive = tdSalesExecutive.Id;
            }

            var result = $.grep(data.value, function (e) { return (e.contactid == createdBy || e.contactid == salesExecutive); });

            if (!(createdBy == DMS.Settings.User.Id || salesExecutive == DMS.Settings.User.Id || result.length > 0)) {
                records.splice(index, 1);
            }
        });
        
        return records;
    }

    function globalRecordValidator(records) {
        if (DMS.Settings.Permission.DeleteScope !== 756150000) {
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

    //delete 
    $(document).on("enableBulkDelete", function (eventContext) {
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
                            DeleteRecords(recordArr, $(this), logicalName);
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

    var DeleteRecords = function (records, modalButton, logicalName) {
        showLoading();
        var recordArrLength = records.length;

        var html = modalButton.html();
        modalButton.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;DELETING..');
        modalButton.addClass('disabled');
        modalButton.siblings('.btn').addClass('disabled');

        var recordArr = records;
        var ajax = customValidator.run(records);
        ajax.then(function (data) {
            $.unblockUI();
            $(".loadingDiv").remove();

            if (DMS.Settings.User.webRole == "Sales Executive" || DMS.Settings.User.webRole == "Sales Supervisor") {
                recordArr = applySupervisorValidator(data, records);
            }

            recordArr = globalRecordValidator(recordArr);

            if (recordArr.length <= 0) {
                HideModal(modalButton, html);
                DMS.Notification.Error('Cannot delete other owner\'s record.');
                return false;
            }
            
            var somethingWasRemoved = recordArrLength == recordArr.length;
            var howMany = recordArrLength - recordArr.length;

            if (recordArr.length <= 0) {
                modalButton.html(html);
                modalButton.removeClass('disabled');
                modalButton.siblings('.btn').removeClass('disabled');
                $('.modal-delete').modal('hide');
                DMS.Notification.Error('Cannot delete other owner\'s record.');
                return;
            }

            if (logicalName == "salesorder") {
                recordArr = statusValidatorSO(recordArr);
                
                if (recordArr.length <= 0) {
                    modalButton.html(html);
                    modalButton.removeClass('disabled');
                    modalButton.siblings('.btn').removeClass('disabled');
                    $('.modal-delete').modal('hide');
                    DMS.Notification.Error('You can only delete record(s) with open status.');
                    return;
                }
            }

            var json = DMS.Helpers.CreateModelWithoutFieldUpdate(recordArr, logicalName);

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
            });
        });
    }

    function statusValidatorSO(records) {
        records.forEach(function (value, index) {

            var $tr = $('tr[data-id="' + value + '"]');

            status = $tr.find('td[data-attribute="gsc_status"]').attr('data-value');
            createdBy = JSON.parse($tr.find('td[data-attribute="gsc_recordownerid"]').attr('data-value')).Id;

            currentUser = DMS.Settings.User.Id;

            if (typeof status === 'undefined' || JSON.parse(status).Value != 100000000) {
                records.splice(index, 1);
            }

        });

        return records;
    }

    function showLoading() {
        $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

        var div = document.createElement("DIV");
        div.className = "view-loading message text-center";
        div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
        var span = document.createElement("SPAN");
        span.className = "fa fa-2x fa-spinner fa-spin";
        div.appendChild(span);
        $(".content-wrapper").append(div);
    }

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
        var logicalName = $('.entity-grid.entitylist').data("view-layouts")[0].Configuration.EntityName;

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

    //close as lost
    $(document).on("enableBulkCloseasLost", function (eventContext) {
        $(document).bind('DOMNodeInserted', function (evt) {
            if ($(evt.target).hasClass('view-toolbar grid-actions')) {

                var classes = 'btn btn-primary CloseAsLost';
                var icon = DMS.Helpers.CreateFontAwesomeIcon('fa-unlink');
                $btnLost = DMS.Helpers.CreateButton('button', classes, '', ' CLOSE AS LOST', icon);

                var isRecordValid = true;
                var records = [];

                $btnLost.on('click', function () {
                    evt.preventDefault();
                    showLoading();

                    var recordArr = [];
                    var message = '';
                    records = getSelectedRecords();
                    var recordArrLength = records.length;

                    if (records.length == 0) {
                        DMS.Notification.Error("Please select a record first.", true, 5000);
                        return false;
                    }

                    var recordArr = records;
                    var ajax = customValidator.run(records);
                    ajax.then(function (data) {
                        $.unblockUI();
                        $(".loadingDiv").remove();

                        var recordArr = applySupervisorValidator(data, records);

                        var somethingWasRemoved = recordArrLength == recordArr.length;
                        var howMany = recordArrLength - recordArr.length;

                        if (recordArr.length <= 0) {
                            DMS.Notification.Error('You are unauthorized to modify this record.');
                            return false;
                        }

                        var status = statusValidator(recordArr);
                        if (status == 2 || status == 1) {
                            DMS.Notification.Error("Opportunity already closed.", true, 5000);
                            return false;
                        }

                        for (var x = 0; x < recordArr.length; x++) {
                            var entityId = recordArr[x];
                            var workflowName = "Opportunity - Close as Lost";
                            var opportunityOdataUrl = "/_odata/quotation?$filter=opportunityid/Id eq (Guid'" + entityId + "')";

                            isRecordValid = validateRecordStatusChange(opportunityOdataUrl);

                            if (isRecordValid == true) {
                                callWorkflow(workflowName, entityId);
                            }
                        }
                    });
                });

                $(evt.target).append($btnLost);
            }
        });
    });

    //close as won
    $(document).on("enableBulkCloseasWon", function (eventContext) {
        $(document).bind('DOMNodeInserted', function (evt) {
            if ($(evt.target).hasClass('view-toolbar grid-actions')) {

                var classes = 'btn btn-primary CloseAsWon';
                var icon = DMS.Helpers.CreateFontAwesomeIcon('fa-trophy');
                $btnWon = DMS.Helpers.CreateButton('button', classes, '', ' CLOSE AS WON', icon);

                var isRecordValid = true;
                var records = [];

                $btnWon.on('click', function () {
                    evt.preventDefault();
                    showLoading();

                    var recordArr = [];
                    var message = '';
                    records = getSelectedRecords();
                    var recordArrLength = records.length;

                    if (records.length == 0) {
                        DMS.Notification.Error("Please select a record first.", true, 5000);
                        return false;
                    }

                    var recordArr = records;
                    var ajax = customValidator.run(records);
                    ajax.then(function (data) {
                        $.unblockUI();
                        $(".loadingDiv").remove();

                        var recordArr = applySupervisorValidator(data, records);

                        var somethingWasRemoved = recordArrLength == recordArr.length;
                        var howMany = recordArrLength - recordArr.length;

                        if (recordArr.length <= 0) {
                            DMS.Notification.Error('You are unauthorized to modify this record.');
                            return false;
                        }

                        var status = statusValidator(recordArr);
                        if (status == 2 || status == 1) {
                            DMS.Notification.Error("Opportunity already closed.", true, 5000);
                            return false;
                        }

                        for (var x = 0; x < recordArr.length; x++) {
                            var entityId = recordArr[x];
                            var workflowName = "Opportunity - Close as Won";
                            var opportunityOdataUrl = "/_odata/quotation?$filter=opportunityid/Id eq (Guid'" + entityId + "')";

                            isRecordValid = validateRecordStatusChange(opportunityOdataUrl);

                            if (isRecordValid == true) {
                                callWorkflow(workflowName, entityId);
                            }
                        }
                    });
                });

                $(evt.target).append($btnWon);
            }
        });
    });

    function statusValidator(records) {
        if (records.length == 1) {
            var status, td = $('tr[data-id=' + records[0] + '] td[data-attribute="statecode"]');

            if (typeof td !== 'undefined') {
                status = td.data('value').Value;
            }
            return status;
        }
    }

    function validateRecordStatusChange(opportunityOdataUrl) {
        var isRecordValid = true;
        $.ajax({
            type: 'get',
            async: false,
            url: opportunityOdataUrl,
            success: function (data) {
                if (data.value.length == 0) {
                    DMS.Notification.Error('Record cannot be updated, there is no associated quote in the record.');
                    isRecordValid = false;
                }
                for (var i = 0; i < data.value.length; i++) {
                    var obj = data.value[i];

                    for (var key in obj) {
                        var attrName = key;
                        var attrValue = obj[key];

                        if (attrName == 'statecode') {
                            var quoteStateCode = attrValue;

                            if (quoteStateCode.Name == 'Draft' || quoteStateCode.Name == 'Active') {
                                DMS.Notification.Error('There are still active or draft quotes associated with the opportunity.');
                                isRecordValid = false;
                            }
                        }
                    }
                }
            },
            error: function (xhr, textStatus, errorMessage) {
                console.log(errorMessage);
            }
        });
        return isRecordValid;
    }

    function callWorkflow(workflowName, entityId) {
        $.ajax({
            type: "PUT",
            url: "/api/Service/RunWorkFlow/?workflowName=" + workflowName + "&entityId=" + entityId,
            success: function (response) {
                var url = document.location.protocol + '//' +
                document.location.host + (document.location.host.indexOf("demo.adxstudio.com") != -1
                ? document.location.pathname.split("/").slice(0, 3).join("/")
                : "") + '/Cache.axd?Message=InvalidateAll&d=' +
                (new Date()).valueOf();

                var req = new XMLHttpRequest();
                req.open('GET', url, false);
                req.send(null); window.location.reload(true);
                DMS.Notification.Success("Record(s) Updated!", true, 5000);
            }
        }).error(function (xhr, textStatus, errorMessage) {
            console.log(errorMessage);
            DMS.Notification.Error(errorMessage, true, 5000);
        });
    }

})(jQuery);






