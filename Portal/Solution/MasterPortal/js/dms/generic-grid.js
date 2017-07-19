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

function EditableGrid(hotOptions, container, sectionDataname, odataUrl, model, newRowModel) {
    var that = this;

    var entityGridTable = $('table[data-name="' + sectionDataname + '"]');
    if (entityGridTable.html() == undefined)
        entityGridTable = $("#" + sectionDataname);
    entityGridTable.addClass("disabledGrid");

    // initialize variables needed
    var changedRows = [], editedCells = [], odataList = [],
        rowDeleted = { index: null, amount: null, records: [] },
        $section = $('table[data-name="' + sectionDataname + '"] tbody tr:first td:first'),
        $save = DMS.Helpers.CreateButton('button', 'save', '', ' SAVE', DMS.Helpers.CreateFontAwesomeIcon('fa-floppy-o')),
        $delete = DMS.Helpers.CreateButton('button', 'cancel', '', ' REMOVE', DMS.Helpers.CreateGlyphIcon('glyphicon-trash')),
        $cancel = DMS.Helpers.CreateButton('button', 'delete', '', ' CANCEL', DMS.Helpers.CreateFontAwesomeIcon('fa-times-circle')),
        $addNewRow = DMS.Helpers.CreateButton('button', 'addnew', '', ' ADD', DMS.Helpers.CreateFontAwesomeIcon('fa-plus')),
        $modal = DMS.Helpers.CreateDeleteConfirmation();

    // default options
    var opt = {
        data: odataList,
        height: 200,
        width: hotOptions.gridWidth,
        outsideClickDeselects: false,
        dataSchema: hotOptions.dataSchema,
        className: "htCenter",
        stretchH: 'all',
        manualColumnResize: false,
        currentRowClassName: 'selectedRow',
        enterBeginsEditingBoolean: false,
        colHeaders: hotOptions.colHeaders,
        columns: hotOptions.columns,
        addNewRows: hotOptions.addNewRows,
        deleteRows: hotOptions.deleteRows,
        btnOptions: hotOptions.btnOptions,
        autoWrapRow: false,
        columnSorting: hotOptions.columnSorting,
        sortIndicator: true,
        autoColumnSize: true,
        tableClassName: ['table', 'table-hover', 'table-condensed'],
        maxRows: 10,
        minSpareRows: 0,
        minSpareCols: 0,
        //  observeChanges: true,
        copyPaste: false
    };

    // initialize hands on table api
    var $hot = new Handsontable(container, opt);

    // enable table responsiveness from view-port
    $(window).on('resize', function () {
        $hot.updateSettings({ width: ($($section).width() - 25) });
    });
    // enable table responsiveness from sidebar adjustment
    $(document).on('sidebarSizeChanged', function () {
        $hot.updateSettings({ width: ($($section).width() - 25) });
    });

    // main 
    this.run = function () {       

        if ($section.html() == undefined) {
            $section = $('#' + sectionDataname);
        }

        $($section).on('resize', function () {
            $hot.updateSettings({ width: ($($section).width() - 10) });
        });

        // setup subgrid section
        this.setupSubGrid();

        // get subgrid data
        this.getSubgridData(odataUrl, true);
       
        // add click event for save button
        this.hookSaveEvent();

        // add click event for cancel button
        this.hookCancelEvent();

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

            if (typeof selectedRow === 'undefined') {
                DMS.Notification.Error('Please select a record first.');
                evt.preventDefault();
                return false;
            }

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

    this.hookCancelEvent = function () {
        if (typeof opt.btnOptions !== 'undefined') {
            if (typeof opt.btnOptions.cancel !== 'undefined') {
                $cancel.on('click', opt.btnOptionlos.cancel);
                return;
            }
        }
        $cancel.on('click', this.crudOptions.cancel);
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

        var $toolbar = $('<div class="editable-grid-toolbar hidden"></div>')
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

        addEntityPermission(model, sectionDataname);

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

    this.getSubgridData = function (odataQuery, fromInitialize) {
        $.ajax({
            type: 'GET',
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            url: odataQuery,
            cache: false
        }).then(function (response) {
            $('.editable-grid').not(".editable-grid-toolbar").removeClass('hidden');
            container.style.display = 'block';
            odataList = response.value;

            if (odataList.length == 0 && (typeof newRowModel !== 'undefined')) {
                opt.height = 150;
                //odataList.push(newRowModel);
                if (model.entity == 'gsc_cmn_quotediscount') {
                    var newModelInstance = jQuery.extend(true, {}, newRowModel);
                    odataList.push(newModelInstance);
                }
                else {
                    setTimeout(function () {
                        $($section).append(DMS.Notification.NoRecordsFound);
                    }, 100);
                }
            }

            if (fromInitialize == true) {
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
                $hot.origData = odataList;

                $section.append($(container).detach());
            }

            hookOnChangeEvent();           
        });
    }

    this.crudOptions = {
        add: function (evt) {
            ////$hot.clearUndo();          
            //odataList.unshift({});
            //odataList.unshift({});
            //$hot.
            var newModelInstance = jQuery.extend(true, {}, newRowModel);
            odataList.unshift(newModelInstance);

            var height = (odataList.length * 35) + 50;

            if (odataList.length <= 1) {
                height = 100;
            }

            if (odataList.length > 10) {
                height = 390;
            }

            $hot.updateSettings({ width: ($($section).width() - 10), height: height });

            $($section).find('div.alert-warning').remove();

            evt.preventDefault();
            return false;
        },
        cancel: function (evt) {

            while ($hot.isUndoAvailable()) {
                $hot.undo();
            }

            setTimeout(function () {
                $cancel.removeClass('disabled');
                $save.removeClass('disabled');
                $cancel.addClass('disabled');
                $save.addClass('disabled');
            }, 1000);

            setTimeout(function () {
                $cancel.addClass('disabled');
                $save.addClass('disabled');
            }, 100);

            $hot.clearUndo();
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

            var dataRows = [];

            for (var i = 0; i < $hot.countRows(); i++) {
                dataRows.push(i);
            }
          
            jQuery.each(dataRows, function (i, row) {

                var record = {
                    Id: $hot.getDataAtRowProp(row, model.id),
                    Entity: model.entity,
                    Records: [],
                    HotRowIndex: row
                }

                jQuery.each(model.attr, function (i, attribute) {
                    var val = $hot.getDataAtRowProp(row, attribute.key);

                    var item = {
                        Attr: null,
                        Value: null,
                        Type: null,
                        Reference: null
                    }

                    if (val !== null && typeof val === 'object') {
                        val = val.Id;
                        item.Reference = attribute.reference;
                    }

                    item.Attr = attribute.key;
                    item.Value = val;
                    item.Type = attribute.type;

                    if (val == null) {
                        item.Value = attribute.value;
                        item.Reference = attribute.reference;
                    }

                    record.Records.push(item);
                });

                clientData.push(record);
            });

            changedRows = [];

            var json = JSON.stringify(clientData);
            var url = "/api/EditableGrid/UpdateRecords";
            var service = Service('PUT', url, json, DMS.Helpers.DefaultErrorHandler);

            service.then(function (data) {
                DMS.Notification.Success('Successfully Saved!', true, 5000);

                data.forEach(function (value, index) {
                    $hot.setDataAtRowProp(value.RowIndex, model.id, value.Id, 'edit');
                });

            }).always(function () {
                $saveButton.html('<span class="fa fa-floppy-o"></span> SAVE');

                that.getSubgridData(odataUrl, false);

                $hot.clearUndo();

                $save.addClass('disabled');
                $cancel.addClass('disabled');

                changedRows = [];

                $hot.deselectCell();
                $hot.render();
            });

            evt.preventDefault();
            return false;
        },
        remove: function (evt) {

            var $deleteButton = $(this);
            $deleteButton.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;DELETING..');
            $deleteButton.addClass('disabled');

            rowDeleted.records.forEach(function (val, index) {
                var recordId = $hot.getDataAtRowProp(val, model.id);

                if (recordId == null) {
                    odataList.splice(rowDeleted.index, rowDeleted.amount);
                    rowDeleted.records.splice(index, 1);
                    return;
                }
                rowDeleted.records[index] = recordId;
            });

            if (rowDeleted.records.length <= 0) {

                $modal.modal("hide");
                $hot.deselectCell();
                $deleteButton.html('<i class="glyphicon glyphicon-trash"></i>&nbsp;DELETE');
                $deleteButton.removeClass('disabled');
                $save.addClass('disabled');
                $cancel.addClass('disabled');

                $hot.clearUndo();
                changedRows = [];
                $hot.deselectCell();
                $hot.render();
                DMS.Notification.Success('Record(s) Sucessfully Deleted!', true, 3000);

                if ($hot.countRows() == 0) {
                    var alert = $($section).find('div.alert-warning');

                    if (typeof alert.html() !== 'undefined') {
                        alert.remove();
                    }
                    $($section).append(DMS.Notification.NoRecordsFound);
                }

                evt.preventDefault();
                return false;
            }

            var json = DMS.Helpers.CreateModelWithoutFieldUpdate(rowDeleted.records, model.entity);

            var url = "/api/EditableGrid/DeleteRecords";

            var service = Service('DELETE', url, json, DMS.Helpers.DefaultErrorHandler);

            service.then(function () {
                odataList.splice(rowDeleted.index, rowDeleted.amount);
                setTimeout(function () {
                    DMS.Notification.Success('Record(s) Sucessfully Deleted!', true, 5000);

                }, 500);
            }).always(function () {
                rowDeleted = { index: null, amount: null, records: [] };
                $modal.modal("hide");

                changedRows = [];
                $hot.clearUndo();

                $deleteButton.html('<i class="glyphicon glyphicon-trash"></i>&nbsp;DELETE');
                $deleteButton.removeClass('disabled');

                $save.addClass('disabled');
                $cancel.addClass('disabled');

                $hot.deselectCell();
                $hot.render();

                if ($hot.countRows() == 0) {
                    var alert = $($section).find('div.alert-warning');

                    if (typeof alert.html() !== 'undefined') {
                        alert.remove();
                    }
                    $($section).append(DMS.Notification.NoRecordsFound);
                }
            });

        }
    }
    /*-- Events/Methods Hooked in the table -- */

    $hot.addHook('beforeRemoveRow', function (index, amount, logicalRows) {

        rowDeleted = { index: index, amount: amount, records: logicalRows };

        $modal.modal('show');

        return false;
    });


    function hookOnChangeEvent() {

        $hot.addHook('afterChange', function (changes, source) {


            if (changes != null) {
                if (changes[0][2] != changes[0][3]) {
                    $save.removeClass('disabled');
                    $cancel.removeClass('disabled');

                    changedRows.push(changes[0][0]);
                }
            }


        });
    }

    this.run();
    return $hot;
}

function addDefaultClass(button, isDisabled) {
    button.addClass('btn btn-default btn-sm btn-primary');
    button.attr('style', 'margin-right: 5px');
    if (isDisabled) {
        button.addClass('disabled');
    }
}

function addEntityPermission(model, sectionDataname) {
    var entityGridTable = $('table[data-name="' + sectionDataname + '"]');

    var entity = model.entity;
    var webRoleId = DMS.Settings.User.webRoleId;
    var recordOwnerId = $("#gsc_recordownerid").val();
    var OwningBranchId = $("#gsc_branchid").val();

    var service = DMS.Service('GET', '~/api/Service/GetEntityGridPrivilages',
      { webRoleId: webRoleId, entityName: entity, recordOwnerId: recordOwnerId, OwningBranchId: OwningBranchId }, DMS.Helpers.DefaultErrorHandler, null);

    service.then(function (response) {
        if (entityGridTable.html() == undefined) {
            entityGridTable = $('#' + sectionDataname);
        }

        if (response == null) return;
        if (response.Read == null) return;

        if (response.Read == false) {
            entityGridTable.find('.editable-grid-toolbar').html('');
            return;
        }

        if (response.Create == false) {
            entityGridTable.find('.editable-grid-toolbar .addnew').remove();
        }

        if (response.Update == false) {
            entityGridTable.find('.editable-grid-toolbar .save').remove();
            entityGridTable.find('.editable-grid-toolbar .btnSaveCopy').remove();
            entityGridTable.find('.editable-grid-toolbar .delete').remove();
            entityGridTable.find('.editable-grid-toolbar .cancelCopy').remove();
        }

        if (response.Delete == false) {
            entityGridTable.find('.editable-grid-toolbar .cancel').remove();
        }

        if (response.Update == true || response.Delete == true)
            entityGridTable.removeClass("disabledGrid");

        entityGridTable.find('.editable-grid-toolbar').removeClass("hidden");
    });
}
