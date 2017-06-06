//// Get context with jQuery - using jQuery's .get() method.
//var areaChartCanvas = $("#areaChart").get(0).getContext("2d");
//// This will get the first returned node in the jQuery collection.
//var areaChart = new Chart(areaChartCanvas);


//var barChartCanvas = $("#barChart").get(0).getContext("2d");
//var barChart = new Chart(barChartCanvas);


//var barChartOptions = {
//    //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
//    scaleBeginAtZero: true,
//    //Boolean - Whether grid lines are shown across the chart
//    scaleShowGridLines: true,
//    //String - Colour of the grid lines
//    scaleGridLineColor: "rgba(0,0,0,.05)",
//    //Number - Width of the grid lines
//    scaleGridLineWidth: 1,
//    //Boolean - Whether to show horizontal lines (except X axis)
//    scaleShowHorizontalLines: true,
//    //Boolean - Whether to show vertical lines (except Y axis)
//    scaleShowVerticalLines: true,
//    //Boolean - If there is a stroke on each bar
//    barShowStroke: true,
//    //Number - Pixel width of the bar stroke
//    barStrokeWidth: 2,
//    //Number - Spacing between each of the X value sets
//    barValueSpacing: 5,
//    //Number - Spacing between data sets within X values
//    barDatasetSpacing: 1,
//    //String - A legend template
//    legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
//    //Boolean - whether to make the chart responsive
//    responsive: true,
//    maintainAspectRatio: true
//};

//barChartOptions.datasetFill = false;

//var areaChartData = {
//    labels: [],
//    datasets: [
//      {
//          label: "Base Models",
//          fillColor: "rgba(60,141,188,0.9)",
//          strokeColor: "rgba(60,141,188,0.8)",
//          pointColor: "#3b8bba",
//          pointStrokeColor: "rgba(60,141,188,1)",
//          pointHighlightFill: "#fff",
//          pointHighlightStroke: "rgba(60,141,188,1)",
//          data: []
//      }
//    ]
//};

//var areaChartData1 = {
//    labels: [],
//    datasets: [
//      {
//          label: "Base Models",
//          fillColor: "rgba(60,141,188,0.9)",
//          strokeColor: "rgba(60,141,188,0.8)",
//          pointColor: "#3b8bba",
//          pointStrokeColor: "rgba(60,141,188,1)",
//          pointHighlightFill: "#fff",
//          pointHighlightStroke: "rgba(60,141,188,1)",
//          data: []
//      }
//    ]
//};


////-------------
////- LINE CHART -
////--------------
//var areaChartOptions = {
//    //Boolean - If we should show the scale at all
//    showScale: true,
//    //Boolean - Whether grid lines are shown across the chart
//    scaleShowGridLines: false,
//    //String - Colour of the grid lines
//    scaleGridLineColor: "rgba(0,0,0,.05)",
//    //Number - Width of the grid lines
//    scaleGridLineWidth: 1,
//    //Boolean - Whether to show horizontal lines (except X axis)
//    scaleShowHorizontalLines: true,
//    //Boolean - Whether to show vertical lines (except Y axis)
//    scaleShowVerticalLines: true,
//    //Boolean - Whether the line is curved between points
//    bezierCurve: true,
//    //Number - Tension of the bezier curve between points
//    bezierCurveTension: 0.3,
//    //Boolean - Whether to show a dot for each point
//    pointDot: false,
//    //Number - Radius of each point dot in pixels
//    pointDotRadius: 4,
//    //Number - Pixel width of point dot stroke
//    pointDotStrokeWidth: 1,
//    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
//    pointHitDetectionRadius: 20,
//    //Boolean - Whether to show a stroke for datasets
//    datasetStroke: true,
//    //Number - Pixel width of dataset stroke
//    datasetStrokeWidth: 2,
//    //Boolean - Whether to fill the dataset with a color
//    datasetFill: true,
//    //String - A legend template
//    legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
//    //Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
//    maintainAspectRatio: true,
//    //Boolean - whether to make the chart responsive to window resizing
//    responsive: true
//};



//$(document).ready(function () {
//    $.ajax({
//        type: 'GET',
//        dataType: "json",
//        contentType: 'application/json; charset=utf-8',
//        url: '~/_odata/invoicedashboard',
//        cache: false
//    }).then(function (response) {

//        var invoiceArr = response.value;
//        var baseModels = [];
//        var labelIds = [];

//        var filtered = invoiceArr.filter(function (elem, index, array) {
//            var baseModel = elem["product-gsc_vehiclemodelid"];
//            if (baseModel == null) return false;

//            return array.map(function (el) {
//                if (el["product-gsc_vehiclemodelid"] != null) {
//                    return el["product-gsc_vehiclemodelid"].Id;
//                }
//            }).indexOf(baseModel.Id) == index;
//        });

//        filtered.forEach(function (item, index) {
//            baseModels.push({ Name: item["product-gsc_vehiclemodelid"].Name, Id: item["product-gsc_vehiclemodelid"].Id, Records: [] });
//        });

//        baseModels.forEach(function (item, index) {
//            item.Records = invoiceArr.filter(function (elem, index, array) {
//                if (elem["product-gsc_vehiclemodelid"] != null) {
//                    return elem["product-gsc_vehiclemodelid"].Id == item.Id;
//                }
//                return false;
//            });
//        });

//        baseModels.forEach(function (item, index) {
//            areaChartData.labels.push(item.Name);
//            areaChartData.datasets[0].data.push(item.Records.length);
//        });

//        areaChart.Line(areaChartData, areaChartOptions);

//    });

//    $.ajax({
//        type: 'GET',
//        dataType: "json",
//        contentType: 'application/json; charset=utf-8',
//        url: '~/_odata/quotedashboard',
//        cache: false
//    }).then(function (response) {
//        var invoiceArr = response.value;
//        var baseModels = [];
//        var labelIds = [];

//        var filtered = invoiceArr.filter(function (elem, index, array) {
//            var baseModel = elem["gsc_vehiclebasemodelid"];
//            if (baseModel == null) return false;

//            return array.map(function (el) {
//                if (el["gsc_vehiclebasemodelid"] != null) {
//                    return el["gsc_vehiclebasemodelid"].Id;
//                }
//            }).indexOf(baseModel.Id) == index;
//        });

//        filtered.forEach(function (item, index) {
//            baseModels.push({ Name: item["gsc_vehiclebasemodelid"].Name, Id: item["gsc_vehiclebasemodelid"].Id, Records: [] });
//        });

//        baseModels = SortArray(baseModels);


//        baseModels.forEach(function (item, index) {
//            item.Records = invoiceArr.filter(function (elem, index, array) {
//                if (elem["gsc_vehiclebasemodelid"] != null) {
//                    return elem["gsc_vehiclebasemodelid"].Id == item.Id;
//                }
//                return false;
//            });
//        });

//        baseModels.forEach(function (item, index) {
//            areaChartData1.labels.push(item.Name);
//            areaChartData1.datasets[0].data.push(item.Records.length);
//        });


//        var barChartData = areaChartData1;

//        barChart.Bar(barChartData, barChartOptions);
//    });
//})

//function SortArray(arr) {
//    return arr.sort(function (a, b) {
//        return (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? -1 : 0);
//    });
//}