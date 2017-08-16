var $window = $(window);
var isInit = false;

function slickInit() {
    if($window.width() < 780 && !isInit) {
        isInit = true;
        $('.sl-slider').slick({
            infinite: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
            arrows: false
        });
    } else if(isInit && $window.width() > 780) {
        $('.sl-slider').slick('unslick');
        isInit = false;
    }
}
slickInit();

$window.resize(function() {
    slickInit()
});
