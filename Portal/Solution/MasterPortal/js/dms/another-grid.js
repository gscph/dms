/*! handsontable editable grid helper
 * @Author  Romy
 * @Email   <jcadiao@gurango.net>
 * @version 1.0.0 
 * @integration with adx portal
*/

// Make sure jQuery has been loaded before generic-grid.js

if (typeof jQuery === "undefined") {
    throw new Error("Editable Grid Helper requires jQuery");
}

function EditableGrid(hotOptions, container, sectionDataname, odataUrl, model) {

    var changedRows = [],
        editedCells = [],
        odataList = [],
        rowDeleted = { index: null, amount: null, records: [] };

    var $section = $('table[data-name="' + sectionDataname + '"] tbody tr:first td:first');
    var $save = $('<button type="button" class="save"><i class="fa fa-floppy-o"></i> SAVE</button>');
    var $cancel = $('<button type="button" class="cancel"><i class="fa fa-remove"></i> CANCEL</button>');
    var $delete = $('<button type="button" class="delete"><i class="glyphicon glyphicon-trash"></i> DELETE</button>');
    var $addNewRow = $('<button type="button" class="add"><i class="fa fa-plus"></i> NEW</button>');
    var deleteModalTemplate =
        '<section aria-hidden="true" class="modal fade modal-delete" data-backdrop="static" role="dialog" tabindex="-1"> \
          <div class="modal-dialog"> \
              <div class="modal-content"> \
                    <div class="modal-header"> \
                        <button class="close" data-dismiss="modal" type="button"> \
                            <span aria-hidden="true">×</span><span class="sr-only">Close</span> \
                        </button> \
                        <h1 class="modal-title h4"><span class="fa fa-trash-o" aria-hidden="true"></span> Delete</h1> \
                    </div> \
                    <div class="modal-body"> \
                        Are you sure you want to delete this record? \
                    </div> \
                    <div class="modal-footer">\
                        <button class="deleteModal btn btn-default btn-dialog" type="button"><i class="glyphicon glyphicon-trash"></i> DELETE</button> \
                        <button class="cancelModal btn btn-default btn-dialog" data-dismiss="modal" type="button"><i class="fa fa-remove"></i> CANCEL</button> \
                    </div> \
               </div> \
           </div> \
    </section>';

    var $modal = $(deleteModalTemplate);

    var opt = {
        data: odataList,
        height: 200,
        width: hotOptions.gridWidth,
        outsideClickDeselects: false,
        dataSchema: hotOptions.dataSchema,
        className: "htCenter",
        stretchH: 'all',
        manualColumnResize: true,
        currentRowClassName: 'selectedRow',
        enterBeginsEditingBoolean: false,
        colHeaders: hotOptions.colHeaders,
        columns: hotOptions.columns,
        addNewRows: hotOptions.addNewRows,
        deleteRows: hotOptions.deleteRows,
        btnOptions: hotOptions.btnOptions,
        autoWrapRow: false,
        columnSorting: true,
        autoColumnSize: true,
        tableClassName: ['table', 'table-hover', 'table-condensed'],
        maxRows: 10,
        minSpareRows: 0,
        minSpareCols: 0,
        observeChanges: true,
        copyPaste: false,
    };

    var $hot = new Handsontable(container, opt);

    $(window).on('resize', function () {
        $hot.updateSettings({ width: $(window).width() - 85 });
    });

    this.run = function () {

        if ($section.html() == undefined) {
            $section = $('#' + sectionDataname);
        }

        // setup subgrid section
        this.setupSubGrid();

        // get subgrid data
        this.getSubgridData(odataUrl);

        // add click event for save button
        //this.hookSaveEvent();

        // add click event for cancel button
     
        //this.hookCancelEvent();

        // add delete event for modal-delete confirmation
        this.hookDeleteEvent($modal.find('button.deleteModal'));

        // add click event for add button if enabled
        if (typeof opt.addNewRows !== 'undefined' && opt.addNewRows) {
            this.hookAddRowEvent();
        }
    }

    this.hookDeleteEvent = function (modalButton) {
        if (typeof opt.btnOptions !== 'undefined') {
            if (typeof opt.btnOptions.remove !== 'undefined') {
                modalButton.on('click', opt.btnOptions.remove);
                return;
            }
        }
        modalButton.on('click', this.crudOptions.remove);

        //toolbar delete
        $delete.on('click', function (evt) {

            var selectedRow = $hot.getSelectedRange(),
                amount, startIndex, endIndex, records = [];

            if (selectedRow.to.row > selectedRow.from.row) {
                amount = (selectedRow.to.row + 1) - selectedRow.from.row;
                startIndex = selectedRow.from.row;
                endIndex = selectedRow.to.row;
            }
            else if (selectedRow.to.row == selectedRow.from.row) {
                amount = 1
                startIndex = selectedRow.from.row;
                endIndex = selectedRow.from.row;
            }
            else {
                amount = (selectedRow.from.row + 1) - selectedRow.to.row;
                startIndex = selectedRow.to.row;
                endIndex = selectedRow.from.row;
            }

            for (var i = startIndex; i <= endIndex; i++) {
                records.push(i);
            }

            rowDeleted = { index: startIndex, amount: amount, records: records };

            $modal.modal('show');

            evt.preventDefault();
            return false;
        });
    }

   

    this.hookAddRowEvent = function () {
        if (typeof opt.btnOptions !== 'undefined') {
            if (typeof opt.btnOptions.add !== 'undefined') {
                $addNewRow.on('click', opt.btnOptions.add);
                return;
            }
        }
        $addNewRow.on('click', this.crudOptions.add);
    }

    this.hookSaveEvent = function () {
        if (typeof opt.btnOptions !== 'undefined') {
            if (typeof opt.btnOptions.save !== 'undefined') {
                $save.on('click', opt.btnOptions.save);
                return;
            }
        }
        $save.on('click', this.crudOptions.save);
    }

    this.setupSubGrid = function (editableGridContainer) {

        var $toolbar = $('<div class="editable-grid-toolbar"></div>')
        // setup subgrid section
        $section.addClass('subgrid-cell');

        addDefaultClass($save, true);
        addDefaultClass($cancel, true);



        if (opt.addNewRows) {
            addDefaultClass($addNewRow, false);
            $toolbar.append($addNewRow);
        }
      
      
        $toolbar.append($save);
        $toolbar.append($cancel);

        if (opt.deleteRows) {
            addDefaultClass($delete, false);
            $toolbar.append($delete);
            $section.append($modal);
        }

        $section.append($toolbar);

        $hot.updateSettings({ contextMenu: this.customContextMenu(opt.addNewRows, opt.deleteRows) });
    }

    this.customContextMenu = function (isAddRowEnabled, isDeleteRowEnabled) {
        return {
            callback: function (key, options) {
                if (key === 'add_row') {
                    odataList.unshift(hotOptions.dataSchema);
                    $hot.updateSettings({
                        maxRows: odataList.length,
                        minSpareRows: 0,
                        minSpareCols: 0
                    });
                    $hot.render();
                }
            },
            items: {
                "add_row": {
                    name: 'Add Row',
                    disabled: function () {
                        if (!isAddRowEnabled) {
                            return true;
                        }
                        return false;
                    }
                },
                "remove_row": {
                    name: 'Delete Record',
                    disabled: function () {
                        if (!isDeleteRowEnabled) {
                            return true;
                        }
                        return false;
                    }
                }
            }
        }
    }

    function addDefaultClass(button, isDisabled) {
        button.addClass('btn btn-default btn-sm btn-primary');
        button.attr('style', 'margin-right: 5px');
        if (isDisabled) {
            button.addClass('disabled');
        }
    }

    function cancelClickEvent(button) {
        button.on('click', function () {
            alert('hey');
        });
    }


    this.getSubgridData = function (odataQuery) {
        $.getJSON(odataQuery)
            .done(function (response) {

                var _section = $('table[data-name="' + sectionDataname + '"] tbody tr:first td:first');

                _section.find('.btn.cancel').click(function (evt) {
                    while ($hot.isUndoAvailable()) {
                        $hot.undo();
                    }
                    $hot.clearUndo();
                    $(this).addClass('disabled');
                    $save.addClass('disabled');

                    changedRows = [];

                    evt.preventDefault();
                    return false;

                });

                _section.find('.btn.save').click(function (evt) {
                    $saveButton = $(this);
                    $saveButton.html('<span class="fa fa-spinner fa-spin"></span>&nbsp;SAVING..');
                    $saveButton.addClass('disabled');
                    $cancel.addClass('disabled');

                    var clientData = [];

                    var unique = changedRows.filter(function (itm, i, a) {
                        return i == a.indexOf(itm);
                    });

                    jQuery.each(unique, function (i, row) {

                        var record = {
                            Id: $hot.getDataAtRowProp(row, model.id),
                            Entity: model.entity,
                            Records: []
                        }

                        jQuery.each(model.attr, function (i, attribute) {
                            var item = {
                                Attr: attribute.key,
                                Value: $hot.getDataAtRowProp(row, attribute.key),
                                Type: attribute.type
                            }

                            record.Records.push(item);
                        });

                        clientData.push(record);
                    });

                    changedRows = [];

                    var json = JSON.stringify(clientData);

                    $.ajax({
                        type: "PUT",
                        url: "/api/EditableGrid/UpdateRecords?records=",
                        contentType: "application/json; charset=utf-8",
                        data: json,
                        statusCode: {
                            500: function (data) {
                                console.log(data.responseText);
                                $saveButton.html('<span class="fa fa-floppy-o"></span> SAVE CHANGES');
                                changedRows.length = 0;
                            }
                        }
                    }).then(function (data) {
                        console.log(data);
                        $saveButton.html('<span class="fa fa-floppy-o"></span> SAVE CHANGES');
                        displaySuccessAlert('Successfully Saved!', true);
                        changedRows.length = 0;
                    });

                    evt.preventDefault();
                    return false;
                });

                odataList = response.value;
                opt.data = odataList;
                opt.maxRows = odataList.length;
                opt.height = (odataList.length * 35) + 50;

                if (odataList.length <= 1) {
                    opt.height = 100;
                }

                if (odataList.length > 10) {
                    opt.height = 390;
                }

                $hot.updateSettings(opt);

                //console.log($section.html());

                //$section.append($(container).detach());
                _section.append($(container).detach());
                //$section.append('<h1>Hello World</h1>');

                $hot.addHook('afterChange', function (changes, source) {

                    if (changes[0][2] !== changes[0][3]) {

                        changedRows.push(changes[0][0]);

                        _section.find('.btn.save').removeClass('disabled');
                        _section.find('.btn.cancel').removeClass('disabled');

                        var cell = $hot.getCell(changes[0][0], $hot.propToCol(changes[0][1]));

                        editedCells.push(cell);

                        changeFontColorToRed(editedCells);

                    }
                });



            });
    }

    this.crudOptions = {
        add: function (evt) {
            odataList.unshift(hotOptions.dataSchema);
            evt.preventDefault();
            return false;
        },
        cancel: function (evt) {

            while ($hot.isUndoAvailable()) {
                $hot.undo();
            }

            $(this).addClass('disabled');
            $save.addClass('disabled');

            changedRows = [];

            evt.preventDefault();
            return false;

        },
        save: function (evt) {
            $saveButton = $(this);
            $saveButton.html('<span class="fa fa-spinner fa-spin"></span>&nbsp;SAVING..');
            $saveButton.addClass('disabled');
            $cancel.addClass('disabled');

            var clientData = [];

            var unique = changedRows.filter(function (itm, i, a) {
                return i == a.indexOf(itm);
            });

            jQuery.each(unique, function (i, row) {

                var record = {
                    Id: $hot.getDataAtRowProp(row, model.id),
                    Entity: model.entity,
                    Records: []
                }

                jQuery.each(model.attr, function (i, attribute) {
                    var item = {
                        Attr: attribute.key,
                        Value: $hot.getDataAtRowProp(row, attribute.key),
                        Type: attribute.type
                    }

                    record.Records.push(item);
                });

                clientData.push(record);
            });

            changedRows = [];

            var json = JSON.stringify(clientData);

            $.ajax({
                type: "PUT",
                url: "/api/EditableGrid/UpdateRecords?records=",
                contentType: "application/json; charset=utf-8",
                data: json,
                statusCode: {
                    500: function (data) {
                        console.log(data.responseText);
                        $saveButton.html('<span class="fa fa-floppy-o"></span> SAVE CHANGES');
                        changedRows.length = 0;
                    }
                }
            }).then(function (data) {
                console.log(data);
                $saveButton.html('<span class="fa fa-floppy-o"></span> SAVE CHANGES');
                displaySuccessAlert('Successfully Saved!', true);
                changedRows.length = 0;
            });

            evt.preventDefault();
            return false;
        },
        remove: function (evt) {
            var $deleteButton = $(this);
            $deleteButton.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;DELETING..');
            $deleteButton.addClass('disabled');
            var clientData = []

            rowDeleted.records.forEach(function (item, index) {
                var record = {
                    Id: $hot.getDataAtRowProp(item, model.id),
                    Entity: model.entity,
                    Records: []
                }

                if (record.Id !== null) {
                    clientData.push(record);
                }

            });

            if (clientData.length <= 0) {

                odataList.splice(rowDeleted.index, rowDeleted.amount);
                $modal.modal("hide");
                $hot.deselectCell();
                $deleteButton.html('<i class="glyphicon glyphicon-trash"></i>&nbsp;DELETE');
                $deleteButton.removeClass('disabled');

                evt.preventDefault();
                return false;
            }

            var json = JSON.stringify(clientData);

            $.ajax({
                type: "DELETE",
                url: "/api/EditableGrid/DeleteRecords",
                contentType: "application/json; charset=utf-8",
                data: json,
                async: true
            }).fail(function (jqXhr) {
                var contentType = jqXhr.getResponseHeader("content-type");
                var error = contentType.indexOf("json") > -1 ? $.parseJSON(jqXhr.responseText) : { Message: jqXhr.status, InnerError: { Message: jqXhr.statusText } };
                displayErrorAlert(error);
            }).then(function () {
                setTimeout(function () {
                    displaySuccessAlert('Sucessfully Deleted!', true);
                    odataList.splice(rowDeleted.index, rowDeleted.amount);
                }, 500);

            }).always(function () {
                rowDeleted = { index: null, amount: null, records: [] };
                $modal.modal("hide");

                $deleteButton.html('<i class="glyphicon glyphicon-trash"></i>&nbsp;DELETE');
                $deleteButton.removeClass('disabled');

                $hot.deselectCell();
                $hot.render();
            });
        }
    }
    /*-- Events/Methods Hooked in the table -- */

    $hot.addHook('beforeRemoveRow', function (index, amount, logicalRows) {

        rowDeleted = { index: index, amount: amount, records: logicalRows };
        $modal.modal('show');

        return false;
    });

    this.run();

    return $hot;
}


function changeFontColorToRed(cells) {

    jQuery.each(cells, function (index, cell) {
        cell.style.color = "#e60026";
    });

}

function changeFontColorToBlack(cells) {

    jQuery.each(cells, function (index, cell) {
        cell.style.color = "black";
    });

}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}



function displaySuccessAlert(success, autohide) {
    var $container = $(".notifications");
    if ($container.length == 0) {
        var $pageheader = $(".page-heading");
        if ($pageheader.length == 0) {
            $container = $("<div class='notifications'></div>").prependTo($("#content-container"));
        } else {
            $container = $("<div class='notifications'></div>").appendTo($pageheader);
        }
    }

    $container.find(".notification").slideUp().remove();
    if (typeof success !== typeof undefined && success !== false && success != null && success != '') {
        var $alert = $("<div class='notification alert alert-success success alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" + success + "</div>")
            .on('closed.bs.alert', function () {
                if ($container.find(".notification").length == 0) $container.hide();
            }).prependTo($container);
        $container.show();

        $('html, body').animate({
            scrollTop: ($alert.offset().top + 50)
        }, 200);
        if (autohide) {
            setTimeout(function () {
                $alert.slideUp(100).remove();
                if ($container.find(".notification").length == 0) $container.hide();
            }, 5000);
        }
    }
}


function displayErrorAlert(error, $element) {

    $element = $('#EntityForm1').find(".entity-form");

    if (typeof error !== typeof undefined && error !== false && error != null) {
        console.error(error);
        var message;
        if (typeof error.InnerError !== typeof undefined && error.InnerError !== false && error.InnerError != null) {
            message = error.InnerError.Message;
        }
        else if (typeof error.ExceptionMessage !== typeof undefined) {
            message = error.ExceptionMessage
        }
        else {
            message = error.Message;
        }
        var $container = $(".notifications");
        if ($container.length == 0) {
            var $pageheader = $(".page-heading");
            if ($pageheader.length == 0) {
                $container = $("<div class='notifications'></div>").prependTo($("#content-container"));
            } else {
                $container = $("<div class='notifications'></div>").appendTo($pageheader);
            }
        }
        $container.find(".notification").slideUp().remove();
        var $status = $element.find(".navbar-collapse").find(".action-status");
        if ($status.length == 0) $status = $element.parent().find(".navbar-collapse").find(".action-status");
        $status.html("<span class='fa fa-fw fa-exclamation-circle text-danger' aria-hidden='true'></span>");
        var $alert = $("<div class='notification alert alert-danger error alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button><span class='fa fa-exclamation-triangle' aria-hidden='true'></span> " + message + "</div>")
            .on('closed.bs.alert', function () {
                $status.html("<span class='fa fa-fw' aria-hidden='true'></span>");
                if ($container.find(".notification").length == 0) $container.hide();
            }).prependTo($container);
        $container.show();
        $('html, body').animate({
            scrollTop: ($alert.offset().top - 20)
        }, 200);
    }
}


