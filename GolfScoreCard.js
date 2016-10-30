/**
 * Created by braydenlemke on 10/28/16.
 */

$("#button-to-form").on("click", function() {
    $("#overlay").removeClass("hidden");
    $("#formPage").slideDown("fast");
});

$("#overlay").on("click", function() {
    $("#overlay").addClass("hidden");
    $("#formPage").css("display", "none");
});

$("#exitButton").on("click", function() {
    $("#overlay").addClass("hidden");
    $("#formPage").css("display", "none");
});