var auto_complete;
const componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
};

function init_autocomplete() {
    auto_complete = new google.maps.places.Autocomplete($("#autocomplete").get(0), {types: ['geocode']});
    auto_complete.addListener('place_changed', auto_fill);
}

function auto_fill() {
    $("[name=autofilled_address]").find(":input").val(function () {
        const address_type = $(this).attr("name");
        const address = auto_complete.getPlace().address_components.find(function (x) {
            return x.types[0] == address_type;
        });

        try {
            return address[componentForm[address_type]];
        } catch(e) {
            return "";
        }
    });
}