/**
 * Created by braydenlemke on 10/28/16.
 */

//---------------------------------------------------------------------------------------
// initial click events
//---------------------------------------------------------------------------------------

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

//---------------------------------------------------------------------------------------
// Populate the form and perform needed ajax requests
//---------------------------------------------------------------------------------------

var lon, lat, golfCourseOptions, currCourse;

var options = {
    enableHighAccuracy: true
};

navigator.geolocation.getCurrentPosition(function(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    var userPosition = {
        latitude: lat,
        longitude: lon
    };
    $.post("http://golf-courses-api.herokuapp.com/courses", userPosition, function(data) {
        golfCourseOptions = JSON.parse(data);
        golfCourseOptions = golfCourseOptions.courses;
        for(var i = 0; i < golfCourseOptions.length; i++) {
            $("#selectCourse").append("<option data-id='"+ golfCourseOptions[i].id +"'>" + golfCourseOptions[i].name + "</option>");
        }
    })

}, error, options);

function error(error) {
    console.log("It didn't work..." + error);
}

function changeCourse() {
    var courseid = $("#selectCourse").find(":selected").data("id");
    $.get("http://golf-courses-api.herokuapp.com/courses/" + courseid, function(data) {
        currCourse = JSON.parse(data);
        currCourse = currCourse.course;
        $("#selectTee").html("");
        for(var i = 0; i < currCourse.tee_types.length; i++) {
            $("#selectTee").append("<option data-teeType='" + currCourse.holes[0].tee_boxes[i].tee_type +"' data-index='"+ i +"'>" + currCourse.holes[0].tee_boxes[i].tee_type + "</option>");
        }
    })
}

function populatePlayerInput() {
    var numName = $("#playerNumInput").val();
    numName = parseInt(numName);
    if(!(isNaN(numName))) {
        if(numName < 7) {
            if(numName > 0) {
                $("#playersInput").html("<div id='errorBoxNumPlayers'></div>");
                for(var i = 0; i < numName; i++) {
                    $("#playersInput").append("<div><label>Player " + (i + 1) + ":</label><input type='text' placeholder='Name' id='playerInput" + i + "'></div>");
                }
            } else {
                $("#playersInput").html("<div id='errorBoxNumPlayers'></div>");
                $("#errorBoxNumPlayers").html("<p>Minimum player limit reached: 1</p>");
            }
        } else {
            $("#playersInput").html("<div id='errorBoxNumPlayers'></div>");
            $("#errorBoxNumPlayers").html("<p>Maximum player limit reached: 6</p>");
        }
    } else {
        $("#playersInput").html("<div id='errorBoxNumPlayers'></div>");
        $("#errorBoxNumPlayers").html("<p>Please enter a number.</p>");
    }
}

