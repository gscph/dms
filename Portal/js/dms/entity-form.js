$(document).ready(function () {           
   
    //$('.row.form-custom-actions').attr('style', 'width:100%;top: 50px; background-color: #FAFAFA;');  

    $('.row.form-custom-actions .clearfix').removeClass('col-sm-6');
    $('.row.form-custom-actions .clearfix').addClass('col-sm-12');

    // iconizing inputs
    $('.fa-input-submit').val($("<div>").html("&#xf0c7; ").text() + $('.fa-input-submit').val());
    $('.fa-input-generate').val($("<div>").html("&#xf022; ").text() + $('.fa-input-generate').val());   

    // remove modal from from toolbar to avoid position: fixed; conflict
    var modal = $('.row.form-custom-actions').find('section.modal.modal-delete').detach();
    $('#EntityFormView').append(modal);

    // move sub-grid buttons
    $('.subgrid .view-toolbar.grid-actions .btn').removeClass('pull-right');

    // apply dms custom buttons to subgrid
    $('.subgrid .view-toolbar.grid-actions .btn.btn-default').addClass('btn-primary');
    $('.subgrid .view-toolbar.grid-actions .btn.btn-default').removeClass('btn-default');

    // apply dms custom buttons to form toolbar buttons
    $('.form-custom-actions .btn.btn-default').addClass('btn-primary');
    $('.form-custom-actions .btn.btn-default').removeClass('btn-default');   
    
    //remove label for textbox status
    $('div[data-name="Footer"] table.section div.info').remove();   
    
    // add margin to the last box 
    $('div.box.box-dms:last').attr('style', 'margin-bottom: 25px');

    // remove status control and convert to display label
    $('div[data-name="Footer"] table.section:last div.control select').removeClass('form-control');
    $('div[data-name="Footer"] table.section:last div.control select').addClass('status-label');

    $('div[data-name="Footer"] table.section:last div.control span').removeClass('state');
    $('div[data-name="Footer"] table.section:last div.control span').addClass('status-label');   

    var closeBtn = '<button type="button" class="close" style="font-size: 12px; color:#333333;" data-dismiss="alert" aria-label="Close"> \
                        <span aria-hidden="true">&times;</span> \
                    </button>';

    $('#MessagePanel').prepend(closeBtn);

    setTimeout(function () {
        $('#MessagePanel').hide();
    }, 10000);

    $('.entitylist-download').removeClass('btn-info');
    $('.entitylist-download').addClass('btn-primary');

    $('#MessageLabel p').removeClass('text-danger');

    //status 
    var value = $(".status-label").find(":selected").html();
    if (value == undefined)
        value = $(".status-label").html();

    if (typeof value !== 'undefined') {
        $('.record-status').html(value);
     //   .append('<span class="status-label">' + value + '</span>');
        //$('div[data-name="Footer"] table.section div.control select.picklist').remove();
    }
    // crumbs
    
    $('.form-custom-actions div.col-sm-12 .form-action-container-left').children().each(function () {
        var $li = $('<li></li>');
        $li.append($(this));
        $('.toolbar-right').append($li);
    });

    $('.form-custom-actions').remove();

   // $('.record-status').html($('.status-label').html());

    $('div[data-name="Footer"]').addClass("hidden");

    $('.modal-lookup .modal-footer > button').each(function () {
        this.innerText = this.innerText.toUpperCase();
    });
   
    //$('.submit-btn').click(duplicateDetect);

    function duplicateDetect() {
        setTimeout(function () {

            var entityLanded = $('#EntityFormView_EntityLayoutConfig').data('form-layout').EntityName;

            var odataUrl = "/_odata/DuplicateDetectSetup?$filter=gsc_entityname eq '" + entityLanded + "'";

            $.ajax({
                type: "get",
                async: true,
                url: odataUrl,
                success: function (data) {
                    for (var i = 0; i < data.value.length; i++) {
                        var obj = data.value[i];
                        for (var key in obj) {
                            var attrName = key;
                            var attrValue = obj[key];
                            if (attrName == 'gsc_cmn_duplicatedetectsetupid') {
                                var duplicateSetupId = attrValue;
                                getDuplicateFields(duplicateSetupId);
                            }
                        }
                    }
                },
                error: function (xhr, textStatus, errorMessage) {
                   // alert(errorMessage);
                }
            });
        }, 100);

    }
    
    function getDuplicateFields(setupId) {

        var odataUrl = "/_odata/DuplicateDetectFields?$filter=gsc_duplicatedetectsetupid/Id eq (Guid'" + setupId + "')";
        var duplicateList = [];
        $.ajax({
            type: "get",
            async: true,
            url: odataUrl,
            success: function (data) {
                
                for (var i = 0; i < data.value.length; i++) {
                    var obj = data.value[i];
                    for (var key in obj) {
                        var attrName = key;
                        var attrValue = obj[key];
                        console.log(attrName);
                        console.log(attrValue);
                        if (attrName == 'gsc_targetfield') {
                            duplicateList[i] = attrValue;
                            alert("asd" + duplicateList.length);
                        }
                    }
                }
            },
            error: function (xhr, textStatus, errorMessage) {
                alert(errorMessage);
            }
        });
       
    }
});


