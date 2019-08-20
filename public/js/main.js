$(function () {
    $('#flash').delay(500).fadeIn('normal', function () {
        $(this).delay(2500).fadeOut();
    });
});
$(window).scroll(function () {
    if ($(this).scrollTop() > 0) {
        $('.down-arrow').fadeOut();
    }
});
