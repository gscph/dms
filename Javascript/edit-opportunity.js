$(document).ready(function () {
  $('.win-opportunity-link.btn.btn-primary').addClass("permanent-disabled disabled");
  
  $('#quote .entity-grid.subgrid').on('loaded', function () {
    if ($('#quote tr').length > 1 && $('.record-status').html() == "Open") {
      if ($('.win-opportunity-link.btn.btn-primary').length == 1)
      $('.win-opportunity-link.btn.btn-primary').removeClass("permanent-disabled disabled");
    }
  });
  
  var status = $('.record-status').html();
  
  if (status != 'Open') {
      checkSubgrid("tab_8_section_1"); // Activities
      checkSubgrid("Quotations"); //Quote
  };
  
  
    var paymentmode = $("#gsc_paymentmode").val();

    if (paymentmode == '100000001') {
        $('#gsc_financingtermid_label').parent("div").addClass("required");
        $('#gsc_financingtermid_name').siblings('.input-group-btn').removeClass('hidden');
    }
    else {
        $('#gsc_financingtermid').val(null);
        $('#gsc_financingtermid_name').val(null);
        $('#gsc_financingtermid_label').parent("div").removeClass("required");
        $('#gsc_financingtermid_name').siblings('.input-group-btn').addClass('hidden');
    }
    
    /*Start - Added by Christell Ann Mataac - 03/10/2017*/
      /*Need to disabled Add Activities and Generate Quote on Opportunity (update), when not owned records*/
     setTimeout(function () {
       if (DMS.Settings.User.positionName == 'Sales Supervisor' || DMS.Settings.User.positionName == 'Sales Lead')
       {
        if(userId != $('#gsc_recordownerid').val())
        {
           $('div.view-toolbar.grid-actions.clearfix').find('a.btn.btn-primary.action.add-margin-right').attr('disabled', true); //Add Accessories
           $('div.navbar.navbar-static-top.toolbar').find('button.btn.btn-primary').eq(3).attr('disabled', true); //Geenrate Quote
           $('button.delete-link.btn.btn-primary').attr('disabled',true); // delete
        }
       }
       else if (DMS.Settings.User.positionName == 'Sales Manager')
       {
         //3-21-2017 - Disable Delete button from opportunity form
        if(userId != $('#gsc_recordownerid').val())
        {
           $('button.delete-link.btn.btn-primary').attr('disabled',true); // delete
        }
       }
       else if (DMS.Settings.User.positionName == 'MMPC System Admin' || DMS.Settings.User.positionName == 'MMPC System Administrator')
       {
         //3-21-2017 - Disable Generate Quote from opportunity form
           $('div.navbar.navbar-static-top.toolbar').find('button.btn.btn-primary').eq(3).attr('disabled', true);
       }
     }, 250);
    /*End - Added by Christell Ann Mataac - 03/10/2017*/
  

    function checkSubgrid(tableDataName) {
        if ($('table[data-name="' + tableDataName + '"]').is(":visible")) {
            $('table[data-name="' + tableDataName + '"]').parent().attr("disabled", "disabled");
            $('table[data-name="' + tableDataName + '"]').parent().addClass("permanent-disabled");
        }
        else {
            setTimeout(function () { checkSubgrid(tableDataName); }, 50);
        }
    }
    
    var isFromClose = false;
    $("#quote section.modal button.close").on("click", function () {
        isFromClose = true;
    });

    $("#quote section.modal").on("hidden.bs.modal", function () {
        if (!isFromClose) {
            $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

            var div = document.createElement("DIV");
            div.className = "view-loading message text-center";
            div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
            var span = document.createElement("SPAN");
            span.className = "fa fa-2x fa-spinner fa-spin";
            div.appendChild(span);
            $(".content-wrapper").append(div);

            location.reload();
        }
        isFromClose = false;
        });
    setTimeout(disableTab, 3000);

    function disableTab()
    {
        $('.disabled').attr("tabindex", "-1");
        $('fieldset.permanent-disabled .btn').attr("tabindex", "-1");
    }
});