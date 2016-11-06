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

var lon, lat, golfCourseOptions, currCourse, numHoles, numName, numPlayers;

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
        numHoles = currCourse.hole_count;
            if(numHoles > 9) {
                $("#selectFrontBack").html("");
                $("#selectFrontBack").append("<option data-frontBack='front'>Front 9</option><option data-frontBack='back'>Back 9</option><option data-frontBack='all'>All 18</option>");
            } else {
                $("#selectFrontBack").html("");
                $("#selectFrontBack").append("<option data-frontBack='front'>9 Holes</option>");
            }
    });
}

function populatePlayerInput() {
    numName = $("#playerNumInput").val();
    numName = parseInt(numName);
    if(!(isNaN(numName))) {
        if(numName < 7) {
            if(numName > 0) {
                $("#playersInput").html("");
                $("#errorBoxNumPlayers").html("");
                for(var i = 0; i < numName; i++) {
                    $("#playersInput").append("<div><input class='specialinput overflow' type='text' placeholder='Player"+ (i + 1) +"' id='playerInput" + i + "'></div>");
                }
            } else {
                $("#playersInput").html("");
                $("#errorBoxNumPlayers").html("");
                $("#errorBoxNumPlayers").html("<p>Minimum player limit reached: 1</p>");
            }
        } else {
            $("#playersInput").html("");
            $("#errorBoxNumPlayers").html("");
            $("#errorBoxNumPlayers").html("<p>Maximum player limit reached: 6</p>");
        }
    } else {
        $("#playersInput").html("");
        $("#errorBoxNumPlayers").html("");
        $("#errorBoxNumPlayers").html("<p>Please enter a number.</p>");
    }
}

if($("#playerNumInput").val() != "") {
    populatePlayerInput();
}

//---------------------------------------------------------------------------------------
// Form Validation
//---------------------------------------------------------------------------------------

$("#formSubmit").on("click", function() {
    var same = 0;
    $("#errorBoxNumPlayers").html("");
    if($("#selectCourse").find(":selected").data("id") != "0") {
        if($("#playerNumInput").val() < 7 && $("#playerNumInput").val() > 0) {
            for(var i = 0; i < numName; i++) {
                for(var j = i + 1; j < numName; j++) {
                    if($("#playerInput" + i).val() == $("#playerInput" + j).val()) {
                        same++;
                    }
                }
            }
            if(same == 0) {
                createScorecard();
            } else {
                $("#errorBoxNumPlayers").html("*No two names can be the same");
            }
        } else {
            $("#errorBoxNumPlayers").html("*Please enter number of players");
        }
    } else {
        $("#errorBoxNumPlayers").html("*Please select a course");
    }
});

//---------------------------------------------------------------------------------------
// Create the scorecard
//---------------------------------------------------------------------------------------

function createScorecard() {
    var whatHole = $("#selectFrontBack").find(":selected").data("frontback");
    $("#scorecard").removeClass("hidden");
    $("#theCard").removeClass("hidden");
    $("#overlay").addClass("hidden");
    $("#formPage").css("display", "none");
    $("#button-to-form").remove();
    $("#startHeader").html(currCourse.name);
    for(var i = 0; i < numName; i++) {
        $("#playerNames").append("<h3 id='player" + i  +"name'>" + $('#playerInput' + i).val() + "</h3>");
    }

    if(whatHole == "all") {
        for(var i = 0; i < (numName + 4); i++){ //hole yards par handicap
            $("#scorecard").append("<div id='row" + i + "' class='row'></div>");
            for(var j = (numHoles + 2); j >= 0; j--) {
                $("#row" + i).append("<div id='row" + i + "column" + j +"' class='card row" + i + "'></div>");
            }
        }
    } else {

    }
}