$(document).ready(function () {
    $('#nav-icon').click(function () {

        if (!$(this).hasClass('open')) {
            $(this).addClass('open');
        }
        else {
            $(this).removeClass('open');
        }
    });

    $('#nav-icon').parent('li.dropdown').on('hidden.bs.dropdown', function () {
        $('#nav-icon').removeClass('open');
    });


    $('ul.dropdown-menu').click(function (event) {
        event.stopPropagation();
    });

    $('ul.dropdown-menu').on("mouseover", function () {
        if (!$('.dropdown .menu-header').hasClass('open')) {
            $('.dropdown .menu-header').addClass('hover');
        }
        else {
            $('.dropdown .menu-header').removeClass('hover');
        }
    });     
  
    SetDropDownWidth(); 
   
}); 

$(window).on('resize', function () {
    SetDropDownWidth();
});

function SetDropDownWidth() {

    var width = $(window).width();
    var top = 87;

    if (width <= 992) {
        top = 87;
    }
    $('.menu-header .dropdown-menu').attr('style', 'width:' + width + 'px;position: fixed;top: ' + top + 'px !important;left: 0 !important; border-top: none !important');
}


$(".sidebar").slimscroll({
    height: ($(window).height() - $(".main-header").height()) + "px",
    //color: "rgba(0,0,0,0.2)",
    color: "#e60026",
    size: "5px",
    railVisible: true,
    allowPageScroll: false
});

$(document).on("initializeEditableGrid", function (event, gridInstance) {
    if (typeof gridInstance !== "undefined") {
        gridInstance.initialize();
    }
});

$(document).on("hideLoader", function () {
    myFunction();
});

var myVar;

function myFunction() {
    myVar = setTimeout(showPage, 10);
}

function showPage() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("mainContents").style.display = "block";
}
