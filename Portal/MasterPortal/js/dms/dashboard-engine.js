if (typeof jQuery === "undefined") {
    throw new Error("Dashboard Engine Helper requires jQuery");
}

var DashboardEngine = function (elementId, title, oDataUrl, type, chartOptions, successHandler) {  

    var options, chartInstance, chartData, element, template;

    if (chartOptions == null && type == 'bar') {
        options = DefaultBarChartOptions();
    }
    else if (chartOptions == null && type == 'area') {
        options = DefaultAreaChartOptions();
    }
    else if (chartOptions == null && type == 'line') {
        options = DefaultAreaChartOptions();
    }
    else if (chartOptions == null && type == 'doughnut') {
        console.log('doughnut options');
        options = DefaultDoughnutOptions();
    }
    else {
        options = chartOptions;
    }


    this.init = function () {
        var chartInstances = $("#" + elementId).get(0).getContext("2d");
        var chartness = new Chart(chartInstances);
        var ajaxResponse = this.getData(oDataUrl);

        ajaxResponse.then(function (response) {
            chartData = successHandler(response);

            if (type == 'bar') {
                chartness.Bar(chartData, options)
            }
            else if (type == 'area') {
                chartness.Line(chartData, options);
            }
            else if (type == 'doughnut') {
                chartness.Doughnut(chartData, options);
            }
            else if (type == 'line') {
                options.datasetFill = false;
                chartness.Line(chartData, options);
            }
        });     
        
    };

    this.render = function () {
        element = $('<canvas></canvas)');
        element.attr('id', elementId);
        element.attr('style', 'height:250px;');

        var grid = this.template();    

        $('#dashboardContainer').append(grid);
    };

    this.template = function () {

        var grid = $('<div class="col-md-6"></div>');
        var box = $('<div class="box box-primary"></div>');
        var boxHeader = $('<div class="box-header withborder"></div>');
        var boxHeaderTitle = $('<h3 class="box-title"></h3>');
        var boxBody = $('<div class="box-body"></div>');
        var boxBodyChart = $('<div class="chart"></div>');

        boxBodyChart.append(element);
        boxBody.append(boxBodyChart);

        boxHeaderTitle.html(title);
        boxHeader.append(boxHeaderTitle);

        box.append(boxHeader);
        box.append(boxBody);

        grid.append(box);

        return grid;
    }


    this.getData = function (url) {
        return $.ajax({
            type: 'GET',
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            url: url,
            cache: false
        });
    };


    this.render();
    this.init();

}



function SortArray(arr) {
    return arr.sort(function (a, b) {
        return (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? -1 : 0);
    });
}

//-------------
//- Bar Chart Default Options -
//--------------
function DefaultBarChartOptions() {

    return barChartOptions = {
        //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
        scaleBeginAtZero: true,
        //Boolean - Whether grid lines are shown across the chart
        scaleShowGridLines: true,
        //String - Colour of the grid lines
        scaleGridLineColor: "rgba(0,0,0,.05)",
        //Number - Width of the grid lines
        scaleGridLineWidth: 1,
        //Boolean - Whether to show horizontal lines (except X axis)
        scaleShowHorizontalLines: true,
        //Boolean - Whether to show vertical lines (except Y axis)
        scaleShowVerticalLines: true,
        //Boolean - If there is a stroke on each bar
        barShowStroke: true,
        //Number - Pixel width of the bar stroke
        barStrokeWidth: 2,
        //Number - Spacing between each of the X value sets
        barValueSpacing: 5,
        //Number - Spacing between data sets within X values
        barDatasetSpacing: 1,
        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
        //Boolean - whether to make the chart responsive
        responsive: true,
        maintainAspectRatio: true
    };
}

function DefaultAreaChartOptions() {
    //-------------
    //- Area / Line Chart Default Options -
    //--------------

    return areaChartOptions = {
        //Boolean - If we should show the scale at all
        showScale: true,
        //Boolean - Whether grid lines are shown across the chart
        scaleShowGridLines: false,
        //String - Colour of the grid lines
        scaleGridLineColor: "rgba(0,0,0,.05)",
        //Number - Width of the grid lines
        scaleGridLineWidth: 1,
        //Boolean - Whether to show horizontal lines (except X axis)
        scaleShowHorizontalLines: true,
        //Boolean - Whether to show vertical lines (except Y axis)
        scaleShowVerticalLines: true,
        //Boolean - Whether the line is curved between points
        bezierCurve: true,
        //Number - Tension of the bezier curve between points
        bezierCurveTension: 0.3,
        //Boolean - Whether to show a dot for each point
        pointDot: false,
        //Number - Radius of each point dot in pixels
        pointDotRadius: 4,
        //Number - Pixel width of point dot stroke
        pointDotStrokeWidth: 1,
        //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
        pointHitDetectionRadius: 20,
        //Boolean - Whether to show a stroke for datasets
        datasetStroke: true,
        //Number - Pixel width of dataset stroke
        datasetStrokeWidth: 2,
        //Boolean - Whether to fill the dataset with a color
        datasetFill: true,
        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
        //Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
        maintainAspectRatio: true,
        //Boolean - whether to make the chart responsive to window resizing
        responsive: true    
    };
}

function DefaultDoughnutOptions() {
    //-------------
    //- Pie Chart Default Options -
    //--------------

    return pieOptions = {
        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke: true,
        //String - The colour of each segment stroke
        segmentStrokeColor: "#fff",
        //Number - The width of each segment stroke
        segmentStrokeWidth: 2,
        //Number - The percentage of the chart that we cut out of the middle
        percentageInnerCutout: 50, // This is 0 for Pie charts
        //Number - Amount of animation steps
        animationSteps: 100,
        //String - Animation easing effect
        animationEasing: "easeOutBounce",
        //Boolean - Whether we animate the rotation of the Doughnut
        animateRotate: true,
        //Boolean - Whether we animate scaling the Doughnut from the centre
        animateScale: false,
        //Boolean - whether to make the chart responsive to window resizing
        responsive: true,
        // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
        maintainAspectRatio: true,
        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
    };
}


