$(document).ready(function () {
    $(".view-toolbar .view-select .dropdown-menu > li a").on("click", function () {
        //$(".view-toolbar ul.view-select li.dropdown .dropdown-menu > li > a").change(function(e) {
        //$(".view-toolbar ul.view-select li.dropdown span.title").change(function(e) {
        //alert($(this).text());
        //var aVal = $(this).text();
        //alert("Customer"+aVal);
        //if ($(this).text() = "Individual" || $(this).text() = "Corporate"){
        $("#customerid_lookupmodal .view-toolbar").addClass('col-md-6 col-xs-12 pull-right');
        //}
    });

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
                        if (isFraud == true) {
                            DMS.Notification.Error("The customer you selected has been identified as a fraud account. Please ask the customer to provide further information.", true, 5000);
                            $("#customerid").val(null);
                            $("#customerid_name").val(null);
                        }
                    },
                    error: function (xhr, textStatus, errorMessage) {
                        console.log(errorMessage);
                    }
                });
            }
        });
    }, 100);

    setTimeout(function () {

        $('#gsc_productid').on('change', function () {
            var productId = $(this).val();
           var markUpPercentage = $('#gsc_markup').val() != "" ? $('#gsc_markup').val() : 0;

            if (productId == "") return;

            var productOdataQuery = "/_odata/product?$filter=productid eq (Guid'" + productId + "')";

            $.ajax({
                type: 'get',
                async: true,
                url: productOdataQuery,
                success: function (data) {

                    if (data.value.length > 0) {
                        var product = data.value[0];

                        var modelYear = product.gsc_modelyear != null ? product.gsc_modelyear : "";
                        var modelCode = product.gsc_modelcode != null ? product.gsc_modelcode : "";
                        var optionCode = product.gsc_optioncode != null ? product.gsc_optioncode : "";
                        var grossWeight = product.gsc_grossvehicleweight != null ? product.gsc_grossvehicleweight : "";
                        var pistonDisplacement = product.gsc_pistondisplacement != null ? product.gsc_pistondisplacement : "";
                        var warrantyYears = product.gsc_warrantyexpirydays != null ? product.gsc_warrantyexpirydays : "";
                        var warrantyMilage = product.gsc_warrantymileage != null ? product.gsc_warrantymileage : "";
                        var otherDetails = product.gsc_othervehicledetails != null ? product.gsc_othervehicledetails : "";
                        var vehicleType = product.gsc_vehicletypeid != null ? product.gsc_vehicletypeid.Name : "";
                        var bodyType = product.gsc_bodytypeid != null ? product.gsc_bodytypeid.Name : "";
                        var fuelType = product.gsc_fueltype != null ? product.gsc_fueltype.Name : "";
                        var transmission = product.gsc_transmission != null ? product.gsc_transmission.Name : "";

                        var result = "Model Year: " + modelYear + "\n" +
                            "Model Code: " + modelCode + "\n" +
                            "Option Code: " + optionCode + "\n" +
                            "Vehicle Type: " + vehicleType + "\n" +
                            "Body Type: " + bodyType + "\n" +
                            "Gross Vehicle Weight: " + grossWeight + "\n" +
                            "Piston Displacement: " + pistonDisplacement + "\n" +
                            "Fuel Type: " + fuelType + "\n" +
                            "Transmission: " + transmission + "\n" +
                            "Warranty Years: " + warrantyYears + "\n" +
                            "Warranty Mileage: " + warrantyMilage + "\n" +
                            "Others: " + otherDetails + "\n";

                        $('#gsc_vehicledetails').val(result);
                    }
                },
                error: function (xhr, textStatus, errorMessage) {
                    console.error(errorMessage);
                }
            });


           $.ajax({
                type: 'get',
                async: true,
                url: '~/api/Service/GetVehicleUnitPrice?productId=' + productId + '&markUp=' + markUpPercentage,
                success: function (data) {
                    $('#gsc_vehicleunitprice').val(data);
                },
                error: function (xhr, textStatus, errorMessage) {
                    $('#gsc_vehicleunitprice').val(0.00);
                    console.error(errorMessage);
                }
            });
        });

    }, 100);
});