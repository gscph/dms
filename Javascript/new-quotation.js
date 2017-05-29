$(document).ready(function (e) {
   //JGC_04042017: Notify user if the selected customer is fraud
  setTimeout(function () {
    $("#customerid").on('change', function () {
            var customerId = $("#customerid").val();
			  if (customerId != "") {
                var customerEntity = $("#customerid_entityname").val();
                var odataName = customerEntity;

                if (customerEntity == "contact")
                    odataName = "individual";

                var customerOdataQuery = "/_odata/" + odataName + "?$filter=" + customerEntity + "id eq (Guid'" + customerId + "')";
                $.ajax({
                    type: 'get',
                    async: true,
                    url: customerOdataQuery,
                    success: function (data) {
                        var customer = data.value[0];
						            var isFraud = customer.gsc_fraud;
                        console.log(customerOdataQuery);
                        if(isFraud == true)
                        {
                          DMS.Notification.Error("The customer you selected has been identified as a fraud account. Please ask the customer to provide further information.",true,5000);
                          $("#customerid").val(null);
                          $("#customerid_name").val(null);
                        }
				          	},
          					error: function (xhr, textStatus, errorMessage) {
                                  console.log(errorMessage);
                              }
				            });
       }});
  },100);
});