$(document).ready(function (e) {
  
  //Added by Ernest Sarmiento 02-08-2017
  //Modified JGC_02222017
  $('#gsc_prospect').hide();
  $('#gsc_prospect_label').hide();

 var status = $("#statecode").html();

 if(status =="Inactive")
  $("#EntityFormView > div:nth-child(12) > div.box-body > div.tab.clearfix > div > div > fieldset").attr("disabled", "disabled");
  
  // JGC 02212017
   if($('#gsc_fraud').is(":checked"))
   {
   $('#CustomersInquiry_Subgrid .entity-grid.subgrid').on('loaded', function() {
     $('#CustomersInquiry_Subgrid .add-margin-right').addClass('permanent-disabled disabled');
   });
   }
 // END
 
   //Added by Ernest Sarmiento 02-22-2017
  $("#primarycontactid").change(function () {
  	var primaryContact = $("#primarycontactid").val();
  	
  	if(primaryContact != ""){
  		var odataUrl = "/_odata/individualCustomerPrimaryContact?$filter=contactid eq (Guid'" +primaryContact  + "')";
  		$.ajax({
  			type: "get",
  			async: true,
  			url: odataUrl,
  			success: function (data) {
  						var contact = data.value[0];
  						$("#telephone2").val(contact.mobilephone);
  						$("#emailaddress1").val(contact.emailaddress1);
  						$("#emailaddress1").siblings(".form-control").find("a").html(contact.emailaddress1);
  						$("#emailaddress1").siblings(".form-control").find("a").attr("href", contact.emailaddress1);
  						$("#gsc_contactrelation").val(contact.gsc_contactrelation);
  					},
  					error: function (xhr, textStatus, errorMessage) {
  						console.log(errorMessage);
  					}
  		});
  	} else {
  		$("#telephone2").val("");
  		$("#emailaddress1").val("");
  		$("#emailaddress1").siblings(".form-control").find("a").html("");
  		$("#emailaddress1").siblings(".form-control").find("a").attr("href", "");
  		$("#gsc_contactrelation").val("");
  	}
  });

  setTimeout(disableTab, 3000);

    function disableTab()
    {
        $('.disabled').attr("tabindex", "-1");
        $('fieldset.permanent-disabled .btn').attr("tabindex", "-1");
    }
})