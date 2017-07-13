$(document).ready(function () {
    $("#UpdateButton").hide();
    var count = 0;
    $(".box.box-dms").each(function () {
        count++;
        if (count == 1)
            return true;
        else
            $(this).addClass("collapsed-box");
    });

    //Purchase Approver Web Role Validations
    if (DMS.Settings.User.webRole === "Purchase Approver")
        $('*[data-name="VIQI_Sold"]').prev().hide();


    //Available
    $btnPrintAvailable = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' PRINT A COPY', DMS.Helpers.CreateFontAwesomeIcon('fa-print'));
    $btnPrintAvailable.click(function (evt) {
        evt.preventDefault();
        PrintReport("347075c2-6f10-e711-80ef-00155d010e2c", "", "");
    });
    $("#AvailableInventory .grid-actions").prepend($btnPrintAvailable);

    //Allocation
    $btnPrintAllocation = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' PRINT A COPY', DMS.Helpers.CreateFontAwesomeIcon('fa-print'));
    $btnPrintAllocation.click(function (evt) {
        evt.preventDefault();
        PrintReport("50bf1ed3-6f10-e711-80ef-00155d010e2c", $('#gsc_allocateddatefrom').val(), $('#gsc_allocateddateto').val());
    });
    $("#AllocatedVehicle .grid-actions").prepend($btnPrintAllocation);

    //UnservedPO
    $btnPrintAllocation = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' PRINT A COPY', DMS.Helpers.CreateFontAwesomeIcon('fa-print'));
    $btnPrintAllocation.click(function (evt) {
        evt.preventDefault();
        PrintReport("39bcb1e4-6f10-e711-80ef-00155d010e2c", $('#gsc_orderddatefrom').val(), $('#gsc_orderdateto').val());
    });
    $("#Unserved .grid-actions").prepend($btnPrintAllocation);

    //Sold
    $btnPrintAllocation = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' PRINT A COPY', DMS.Helpers.CreateFontAwesomeIcon('fa-print'));
    $btnPrintAllocation.click(function (evt) {
        evt.preventDefault();
        PrintReport("8f8e50de-6f10-e711-80ef-00155d010e2c", $('#gsc_solddatefrom').val(), $('#gsc_solddateto').val());
    });
    $("#subgrid_soldvehicledetails .grid-actions").prepend($btnPrintAllocation);

    setTimeout(function () {
        $.cookie("ProductQuantityId", DMS.Helpers.GetUrlQueryString("id"), { path: '/' });
        // RefreshGrid("AllocatedVehicle");
        //RefreshGrid("Unserved");
        // RefreshGrid("subgrid_soldvehicledetails");

        //Allocated
        $('#AllocatedVehicle .btn-primary:eq(2)').click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            $.cookie("AllocatedDateFrom", $("#gsc_allocateddatefrom").val(), { path: '/' });
            $.cookie("AllocatedDateTo", $("#gsc_allocateddateto").val(), { path: '/' });
            $("#AllocatedVehicle").children(".subgrid").trigger("refresh");
        });

        $('#gsc_allocateddatefrom').next('.datetimepicker').on("dp.change", function (e) {
            setMinDate("gsc_allocateddatefrom", "gsc_allocateddateto", e.date);
        });

        $('#gsc_allocateddateto').next('.datetimepicker').on("dp.change", function (e) {
            setMaxDate("gsc_allocateddatefrom", "gsc_allocateddateto", e.date);
        });

        $('#gsc_allocateddatefrom').next(".datetimepicker").children("input").on("change", function (e) {
            var dateFrom = $('#gsc_allocateddatefrom').val() != "" ? new Date($('#gsc_allocateddatefrom').val()) : "";
            setMinDate("gsc_allocateddatefrom", "gsc_allocateddateto", dateFrom != "" ? new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate()) : "");
        });

        $('#gsc_allocateddateto').next(".datetimepicker").children("input").on("change", function (e) {
            var dateTo = $('#gsc_allocateddateto').val() != "" ? new Date($('#gsc_allocateddateto').val()) : "";
            setMaxDate("gsc_allocateddatefrom", "gsc_allocateddateto", dateTo != "" ? new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate()) : "");
        });

        //Unserved
        $('#Unserved .btn-primary:eq(2)').click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            $.cookie("OrderDateFrom", $("#gsc_orderdatefrom").val(), { path: '/' });
            $.cookie("OrderDateTo", $("#gsc_orderdateto").val(), { path: '/' });
            $("#Unserved").children(".subgrid").trigger("refresh");
        });

        $('#gsc_orderdatefrom').next('.datetimepicker').on("dp.change", function (e) {
            setMinDate("gsc_orderdatefrom", "gsc_orderdateto", e.date);
        });

        $('#gsc_orderdateto').next('.datetimepicker').on("dp.change", function (e) {
            setMaxDate("gsc_orderdatefrom", "gsc_orderdateto", e.date);
        });

        $('#gsc_orderdatefrom').next(".datetimepicker").children("input").on("change", function (e) {
            var dateFrom = $('#gsc_orderdatefrom').val() != "" ? new Date($('#gsc_orderdatefrom').val()) : "";
            setMinDate("gsc_orderdatefrom", "gsc_orderdateto", dateFrom != "" ? new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate()) : "");
        });

        $('#gsc_orderdateto').next(".datetimepicker").children("input").on("change", function (e) {
            var dateTo = $('#gsc_orderdateto').val() != "" ? new Date($('#gsc_orderdateto').val()) : "";
            setMaxDate("gsc_orderdatefrom", "gsc_orderdateto", dateTo != "" ? new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate()) : "");
        });

        //Sold
        $('#subgrid_soldvehicledetails .btn-primary:eq(2)').click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            $.cookie("SoldDateFrom", $("#gsc_solddatefrom").val(), { path: '/' });
            $.cookie("SoldDateTo", $("#gsc_solddateto").val(), { path: '/' });
            $("#subgrid_soldvehicledetails").children(".subgrid").trigger("refresh");
        });

        $('#gsc_solddatefrom').next('.datetimepicker').on("dp.change", function (e) {
            setMinDate("gsc_solddatefrom", "gsc_solddateto", e.date);
        });

        $('#gsc_solddateto').next('.datetimepicker').on("dp.change", function (e) {
            setMaxDate("gsc_solddatefrom", "gsc_solddateto", e.date);
        });

        $('#gsc_solddatefrom').next(".datetimepicker").children("input").on("change", function (e) {
            var dateFrom = $('#gsc_solddatefrom').val() != "" ? new Date($('#gsc_solddatefrom').val()) : "";
            setMinDate("gsc_solddatefrom", "gsc_solddateto", dateFrom != "" ? new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate()) : "");
        });

        $('#gsc_solddateto').next(".datetimepicker").children("input").on("change", function (e) {
            var dateTo = $('#gsc_solddateto').val() != "" ? new Date($('#gsc_solddateto').val()) : "";
            setMaxDate("gsc_solddatefrom", "gsc_solddateto", dateTo != "" ? new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate()) : "");
        });

    }, 100);

    function PrintReport(reportName, dateFrom, dateTo) {

        dateFrom = dateFrom != "" ? new Date(dateFrom) : "";
        var dateFromString = dateFrom != "" ? dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate() : "";

        dateTo = dateTo != "" ? new Date(dateTo) : "";
        var dateToString = dateTo != "" ? dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate() : "";

        var param1var = DMS.Helpers.GetUrlQueryString('id');
        var protocol = window.location.protocol;
        var host = window.location.host;
        var url = protocol + "//" + host + "/report/?reportname={" + reportName + "}&reportid=" + param1var + "&datefrom=" + dateFromString + "&dateto=" + dateToString + "";

        window.open(url, 'blank', 'scrollbars=1,resizable=1,width=1000,height=850');
    }

    function RefreshGrid(divName) {
        if ($("#" + divName + " .view-loading").is(":visible")) {
            setTimeout(function () { RefreshGrid(divName); }, 50);
        }
        else {
            setTimeout(function () { $("#" + divName + " .btn-primary:eq(2)").click() }, 3000);
        }
    }

    function setMinDate(DateFromField, DateToField, date) {
        var from = $('#' + DateFromField).val();
        var to = $('#' + DateToField).val();

        if (from != "") {
            if (from > to) {
                $('#' + DateToField).next(".datetimepicker").children("input").val("")
            }
            $('#' + DateToField).next('.datetimepicker').data("DateTimePicker").setMinDate(date);

        }
        else {
            $('#' + DateToField).next('.datetimepicker').data("DateTimePicker").setMinDate(new Date(1700, 1, 1));
        }
    }

    function setMaxDate(DateFromField, DateToField, date) {
        var from = $('#' + DateFromField).val();
        var to = $('#' + DateToField).val();

        if (to != "") {
            if (from > to) {
                $('#' + DateFromField).next(".datetimepicker").children("input").val("")
            }
            $('#' + DateFromField).next('.datetimepicker').data("DateTimePicker").setMaxDate(date);
        }
        else {
            $('#' + DateFromField).next('.datetimepicker').data("DateTimePicker").setMaxDate(new Date(4000, 12, 31));
        }
    }

});