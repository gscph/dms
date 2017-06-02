$(document).ready(function () {
    var param1var = DMS.Settings.User.dealerId;
    var protocol = window.location.protocol;
    var host = window.location.host;
    var url = protocol + "//" + host + "/report/?reportname={b974d1d9-4dda-e611-80ed-00155d010e2c}&reportid=" + param1var;
    window.open(url, 'blank', 'width=1000,height=850');
    console.log(url);
});

$(function () {
    function hello() {

    }
})