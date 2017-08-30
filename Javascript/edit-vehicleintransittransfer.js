//Created By : Raphael Herrera, Created On : 8/23/2016
$(document).bind('DOMNodeInserted', function (evt) {
    var isSubGridFrm = $(evt.target).parent().parent('#AllocatedVehicle.subgrid').html();
    if ((typeof isSubGridFrm !== 'undefined')) {
        var table = $(evt.target).siblings('.view-grid.table-responsive');
    }
});

$(document).ready(function () {
    var inTransitStatus = $(".record-status").html();

    $('#gsc_intransittransferstatus').attr('readOnly', true);
    $('#gsc_intransittransferstatus').css({ "pointer-events": "none", "cursor": "default" });
    
    drawAllocateButton();
    drawShipButton();
    drawCancelButton();
   
    $('#gsc_inventoryidtoallocate').hide();
    $('#gsc_inventoryidtoallocate_label').hide();
    $('.sort-disabled').innerHTML = "<a href=\"#\"> Site </a>";

    setTimeout(function () {
      if(DMS.Settings.Permission.Update == false)
      {
        $(".dropdown.action").hide();
        $(".grid-actions").hide();
      }
      $('#gsc_isshipping').hide();
      //RefreshAvailableItems($(".btn-primary").closest("div #Inventory"), 1, 4);
      
      $('.btn-primary').on('click', function (e) {
        var $subgrid = $(this).closest(".subgrid");
        var $subgridId = $subgrid.parent().attr("id");
        
        if ($subgridId == "Inventory") {
          e.preventDefault();
          e.stopPropagation();
          //RefreshAvailableItems($subgrid.parent(), 1, 4);
        }
      });
      
      /* inTransitStatus != Picked */
      if (inTransitStatus != 'Picked') {
        DMS.Helpers.DisableEntityForm();
      }
      drawPrintButton();
    }, 2000);
    
    function RefreshAvailableItems($parent, page, PageSize) {
        var $subgrid = $parent.children(".subgrid");
        var $table = $subgrid.children(".view-grid").find("table");
        var $tbody = $("<tbody></tbody>");
        var $errorMessage = $subgrid.children(".view-error");
        var $emptyMessage = $subgrid.children(".view-empty");
        var $accessDeniedMessage = $subgrid.children(".view-access-denied");
        var $loadingMessage = $subgrid.children(".view-loading");
        var $pagination = $subgrid.children(".view-pagination");
        var url = $subgrid.data("get-url");
        var layout = $subgrid.data("view-layouts");
        var configuration = layout[0].Configuration;
        var base64SecureConfiguration = layout[0].Base64SecureConfiguration;
        var sortExpression = $table.data("sort-expression");

        $subgrid.children(".view-grid").find("tbody").remove();

        $errorMessage.hide().prop("aria-hidden", true);
        $emptyMessage.hide().prop("aria-hidden", true);
        $accessDeniedMessage.hide().prop("aria-hidden", true);

        $loadingMessage.show().prop("aria-hidden", false);

        $pagination.hide();

        var odataUrl = "/_odata/inventory?$filter=gsc_status/Value eq 100000000";
        $.ajax({
            type: "get",
            async: true,
            url: odataUrl,
            success: function (inventory) {

                var filteredInventory = inventory.value.filter(FilterInventory);

                ReCreateInventoryTable($parent, filteredInventory, page, PageSize);
            }
        });

    }

    //filtered inventory of the filter criteria
    function FilterInventory(data) {

        var colorIdFilter = $("#gsc_colorid_name").val();
        var siteIdFilter = $("#gsc_siteid").val();
        var modelDescriptionFilter = $("#gsc_productid").val();
        var modelCodeFilter = $("#gsc_modelcode").val();
        var optionCodeFilter = $("#gsc_optioncode").val();
        var baseModelFilter = $('#gsc_modelid').val();

        var colorId = data["gsc_color"];
        var siteId = data["gsc_iv_productquantity-gsc_siteid"];
        var productId = data["gsc_iv_productquantity-gsc_productid"];
        var modelCode = data["gsc_modelcode"];
        var optionCode = data["gsc_optioncode"];
        var baseModel = data["gsc_iv_productquantity-gsc_vehiclemodelid"];

        var removeData = false;

        if (colorIdFilter != null && colorIdFilter != "")
            if (colorId != colorIdFilter)
                removeData = true;

        if (siteIdFilter != null && siteIdFilter != "")
            if (siteId != null) {
                if (siteId.Id != siteIdFilter)
                    removeData = true;
            }
            else
                removeData = true;

        if (modelDescriptionFilter != null && modelDescriptionFilter != "")
            if (productId != null) {
                if (productId.Id != modelDescriptionFilter)
                    removeData = true;
            }
            else
                removeData = true;

        if (baseModelFilter != null && baseModelFilter != "")
            if (baseModel != null) {
                if (baseModel.Id != baseModelFilter)
                    removeData = true;
            }
            else
                removeData = true;

        if (modelCodeFilter != null && modelCodeFilter != "")
            if (modelCodeFilter != modelCode)
                removeData = true;

        if (optionCodeFilter != null && optionCodeFilter != "")
            if (optionCodeFilter != optionCode)
                removeData = true;

        if (removeData == false)
            return data;

    }

    function ReCreateInventoryTable($parent, data, page, PageSize) {
        var $subgrid = $parent.children(".subgrid");
        var $table = $subgrid.children(".view-grid").find("table");
        var $tbody = $("<tbody></tbody>");
        var $errorMessage = $subgrid.children(".view-error");
        var $emptyMessage = $subgrid.children(".view-empty");
        var $accessDeniedMessage = $subgrid.children(".view-access-denied");
        var $loadingMessage = $subgrid.children(".view-loading");
        var $pagination = $subgrid.children(".view-pagination");
        var url = $subgrid.data("get-url");
        var layout = $subgrid.data("view-layouts");
        var configuration = layout[0].Configuration;
        var base64SecureConfiguration = layout[0].Base64SecureConfiguration;
        var sortExpression = $table.data("sort-expression");

        $subgrid.children(".view-grid").find("tbody").remove();

        $errorMessage.hide().prop("aria-hidden", true);
        $emptyMessage.hide().prop("aria-hidden", true);
        $accessDeniedMessage.hide().prop("aria-hidden", true);

        $loadingMessage.show().prop("aria-hidden", false);


        if (typeof data !== typeof undefined && data !== false && (data == null || data.length == 0)) {
            $emptyMessage.fadeIn().prop("aria-hidden", false);
            $loadingMessage.hide().prop("aria-hidden", true);
            return;
        }

        var columns = $.map($table.find("th"), function (e) {
            return $(e).data('field');
        });

        var nameColumn = columns.length == 0 ? "" : columns[0] == "col-select" ? columns[1] : columns[0];

        $subgrid.data("total-record-count", data.length);

        var pageStart = (parseInt(page) - 1) * parseInt(PageSize);
        var pageEnd = parseInt(pageStart) + (parseInt(PageSize - 1));

        data.forEach(function (item, index) {

            if ((index < pageStart)) {
                return true;
            }
            else if ((index > pageEnd)) {
                return false;
            }

            var record = item;
            var name = record.gsc_inventorypn;

            var $tr = $("<tr></tr>")
                .attr("data-id", record.gsc_iv_inventoryid)
                .attr("data-entity", configuration.EntityName)
                .attr("data-name", name)
                .on("focus", function () {
                    $(this).addClass("active");
                })
                .on("blur", function () {
                    $(this).removeClass("active");
                });

            for (var j = 0; j < columns.length; j++) {
                var found = false;

                $.each(item, function (key, value) {
                    if (key == columns[j]) {
                        var html = value;
                        var $td = $("<td></td>")
                            .attr("data-attribute", value)
                            .attr("data-value", typeof value === 'object' ? JSON.stringify(value) : value)
                            .html(html);

                        $tr.append($td);
                        found = true;
                        return false;
                    }
                    else if (key.split("-").pop() == columns[j].split(".").pop()) {
                        var html;
                        if (value != null) {
                            html = value.Name;
                        }
                        else {
                            html = "";
                        }

                        var $td = $("<td></td>")
                            .attr("data-attribute", value)
                            .attr("data-value", typeof value === 'object' ? JSON.stringify(value) : value)
                            .html(html);

                        $tr.append($td);
                        found = true;
                        return false;
                    }
                });
                if (!found) {
                    var typeColumn = columns[j];
                    //   console.log(columns);

                    var $td = $("<td></td>")
                        .attr("data-attribute", columns[j]);

                    $tr.append($td);
                };
            }

            $tbody.append($tr);
        });

        $subgrid.children(".view-grid").children("table").append($tbody.show());
        $subgrid.fadeIn();
        initializePagination(data, $parent, page);
        $loadingMessage.hide().prop("aria-hidden", true);

    }

    function initializePagination(data, $parent, PageNumber) {
        // requires ~/js/jquery.bootstrap-pagination.js

        var $subgrid = $parent.children(".subgrid");
        var $pagination = $subgrid.children(".view-pagination");
        var ItemCount = data.length;
        var PageSize = 4;
        var PageCount = ItemCount / PageSize;

        if (typeof data === typeof undefined || data === false || data == null) {
            $pagination.hide();
            return;
        }

        if (PageCount <= 1) {
            $pagination.hide();
            return;
        }

        $pagination
            .data("pagesize", PageSize)
            .data("pages", PageCount)
            .data("current-page", PageNumber)
            .data("count", ItemCount)
            .off("click")
            .pagination({
                total_pages: $pagination.data("pages"),
                current_page: $pagination.data("current-page"),
                callback: function (event, pg) {
                    var $li = $(event.target).closest("li");
                    if ($li.not(".disabled").length > 0 && $li.not(".active").length > 0) {
                        $pagination.show();
                        RefreshAvailableItems($parent, pg, PageSize);
                    }
                    event.preventDefault();
                }
            })
            .show();
    }

    function drawAllocateButton() {
        var allocateButton = document.createElement("BUTTON");
        var allocate = document.createElement("SPAN");
        allocate.className = "fa fa-lock";
        allocateButton.appendChild(allocate);
        var allocateButtonLabel = document.createTextNode(" ALLOCATE");
        allocateButton.appendChild(allocateButtonLabel);
        allocateButton.className = "allocate-link btn btn-primary action disabled";
        allocateButton.addEventListener("click", allocateVehicle);
        $("#Inventory").find(".view-toolbar.grid-actions.clearfix").append(allocateButton);
    }
    
    $(document).on('click', '#Inventory tbody tr', addEventInventory);
    setTimeout(function() {
      $('#Inventory tbody tr td:first-child').click(function () {
        addEventInventory();
      });
    }, 3000);
    
    function addEventInventory() {
      var counter = 0;
      
      $('#Inventory tbody tr td.multi-select-cbx').each(function () {
        if ($(this).data('checked') == "true") {
          counter++;
        }
      });
      
      if (counter > 0 && $('.record-status').html() == 'Picked') {
        $('#Inventory .allocate-link').removeClass('disabled');
      } else {
        $('#Inventory .allocate-link').addClass('disabled');
      }
    }
    
    checkRefreshButton();
    
    function checkRefreshButton() {
      if ($('a:contains(" REFRESH")').is(':visible')) {
        $('a:contains(" REFRESH")').attr('id', 'refresh');
        document.getElementById('refresh').addEventListener('click', DMS.Helpers.Debounce(function (e) {
          e.preventDefault();
          $(document).on('click', '#Inventory tbody tr', addEventInventory);
          $('#Inventory').children('.subgrid').trigger('refresh');
        }, 500));
      }
      else {
        setTimeout(checkRefreshButton, 50);
      }
    }
    
    function drawShipButton() {
        var shipButton = document.createElement("BUTTON");
        var ship = document.createElement("SPAN");
        ship.className = "fa fa-ship";
        shipButton.appendChild(ship);
        var shipButtonLabel = document.createTextNode(" SHIP");
        shipButton.appendChild(shipButtonLabel);
        shipButton.addEventListener("click", shipTransaction);
        shipButton.className = "btn btn-primary";
        DMS.Helpers.AppendButtonToToolbar(shipButton);
    }

    function drawCancelButton() {
        var cancelButton = document.createElement("BUTTON");
        var cancel = document.createElement("SPAN");
        cancel.className = "fa fa-ban";
        cancelButton.appendChild(cancel);
        var cancelButtonLabel = document.createTextNode(" CANCEL");
        cancelButton.appendChild(cancelButtonLabel);
        cancelButton.className = "btn btn-primary";
        cancelButton.addEventListener("click", cancelTransaction);
        DMS.Helpers.AppendButtonToToolbar(cancelButton);
    }

    function drawPrintButton() {
      var printButton = document.createElement("BUTTON");
      var print = document.createElement("SPAN");
      print.className = "fa fa-print";
      printButton.appendChild(print);
      var printButtonLabel = document.createTextNode(" PRINT");
      printButton.appendChild(printButtonLabel);
      printButton.className = "allocate-link btn btn-primary action";

      printButton.addEventListener("click", function (event) {

          printVehileInTransitTransfer();
          event.preventDefault();
      });
      DMS.Helpers.AppendButtonToToolbar(printButton);
    }

    function printVehileInTransitTransfer() {
        var param1var = getQueryVariable("id");
        var protocol = window.location.protocol;
        var host = window.location.host;
        var url = protocol + "//" + host + "/report/?reportname={96BD2042-E870-E611-80DB-00155D010E2C}&reportid=" + param1var;
        window.open(url, 'blank', 'width=500,height=400');
    }

    function allocateVehicle(event) {
        var count = 0;
        var id = "";

        $('#Inventory tbody tr td.multi-select-cbx').each(function () {
            if ($(this).data('checked') == "true") {
                count += 1;
                id = $(this).closest('tr').data('id');
            }
        });

        if (count == 1) {
            $("#gsc_inventoryidtoallocate").val(id);
            $("#UpdateButton").click();
        }
        else {
            var allocationNotif = document.createElement("div");
            allocationNotif.innerHTML = '<div">' +
                '<div class="alert alert-danger">' +
                '<span class="glyphicon glyphicon-exclamation-sign"></span>' +
                'You can only allocate one vehicle per transaction.</div>';
            allocationNotif.setAttribute("id", "allocationNotif");
            $("#confirmOnExitMessage").after(allocationNotif);
            $('html,body').scrollTop(0);
        }
        //event.preventDefault();
    }

    function cancelTransaction() {
        $('#gsc_intransittransferstatus').val('100000003');
        $('#UpdateButton').click();
    }

    function shipTransaction() {
        $('#gsc_intransittransferstatus').val('100000001');
        $('#gsc_isshipping').attr('checked', 'checked');
        $('#UpdateButton').click();
    }

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
    }

    function preventDefault(event) {
        event.preventDefault();
    }

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
    }

});