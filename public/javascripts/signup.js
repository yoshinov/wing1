$(document).ready(function () {
    var display_lang = "日本語";
    var lang_data    = {};  //TODO: constにしたい

    const translate = function () {
        $(".translate").text(function () {
            const text = $(this).attr("title");

            try {
                return lang_data[text][display_lang];
            } catch (e) {
                return "";
            }
        });
    };

    $.getJSON("javascripts/language.json", function (response) {
        lang_data = response;
        translate();
    });

    $("#signup").on("submit", function () {
        const password = $("#pw").val();
        const confirm  = $("#confirm").val();

        if (password != confirm) {
            alert(lang_data["confirmation_fail"][display_lang]);
            return false;
        }
    });

    $("[name=language]").on("change", function () {
        display_lang = $(this).val();
        translate();
    });

    $("#style_change").on("change", function () {
        const style = $("#css");
        switch ($(this).val()) {
            case "design1":
                style.attr("href", "stylesheets/design1.css");
                break;
            case "design2":
                style.attr("href", "stylesheets/design2.css");
                break;
        }
    })
});