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
    var teetype = $("#selectTee").find(":selected").data("index");
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
        //put in the holes
        for(var i = 0, hole = 1; i < (numHoles + 3); i++) {
            if(i == 9) {
                $("#row0column" + i).append("<p>OUT</p>");
            }
            else if(i == 19) {
                $("#row0column" + i).append("<p>IN</p>");
            }
            else if(i == 20) {
                $("#row0column" + i).append("<p>Total</p>");
            } else {
                $("#row0column" + i).append("<p>" + hole + "</p>");
                hole++;
            }
        }
        //put in the yards, handicap, and par
        for(var i = 0, hole = 0; i < (numHoles + 3); i++) {
            if(i != 9 && i < 19) {
                $("#row1column" + i).append("<p class='yards'>" + currCourse.holes[hole].tee_boxes[teetype].yards + "</p>");
                $("#row2column" + i).append("<p class='par'>" + currCourse.holes[hole].tee_boxes[teetype].par + "</p>");
                $("#row3column" + i).append("<p class='handicap'>" + currCourse.holes[hole].tee_boxes[teetype].hcp + "</p>");
                hole++;
            }
            else if(i == 9) {
                $("#row1column" + i).append("<p class='yards'>" + calculateOutYards(teetype) + "</p>");
                $("#row2column" + i).append("<p class='par'>" + calculateOutPar(teetype) + "</p>");
            }
            else if(i == 19) {
                $("#row1column" + i).append("<p class='yards'>" + calculateInYards(teetype) + "</p>");
                $("#row2column" + i).append("<p class='par'>" + calculateInPar(teetype) + "</p>");
            } else {
                $("#row1column" + i).append("<p class='yards'>" + calculateTotalYards(teetype) + "</p>");
                $("#row2column" + i).append("<p class='par'>" + calculateTotalPar(teetype) + "</p>");
            }
        }
        //add the inputs to the player boxes
        for(var i = 0, row = 4; i < numName; i++) {
            for(var j = 0, hole = 0; j < (numHoles + 3); j++) {
                if(i % 2 == 0) {
                    $("#row" + row + "column" + j).addClass("column" + j + "even");
                } else {
                    $("#row" + row + "column" + j).addClass("column" + j + "odd");
                }

                if(j != 9 && j < 19) {
                    if(i % 2 == 0) {
                        $("#row" + row + "column" + j).append("<input id='player"+ i +"column"+ j +"' class='scoreInput even' type='text' onkeyup='checkValidation(this.value, this.id)'>");
                        hole++;
                    } else {
                        $("#row" + row + "column" + j).append("<input id='player"+ i +"column"+ j +"' class='scoreInput odd' type='text' onkeyup='checkValidation(this.value, this.id)'>");
                        hole++;
                    }
                }

            }
            row++;
        }
    }
    else if(whatHole == "front") {
        numHoles = 9;
        for(var i = 0; i < (numName + 4); i++){ //hole yards par handicap
            $("#scorecard").append("<div id='row" + i + "' class='row'></div>");
            for(var j = numHoles; j >= 0; j--) {
                $("#row" + i).append("<div id='row" + i + "column" + j +"' class='card row" + i + "'></div>");
            }
        }

        for(var i = 0, hole = 1; i < (numHoles + 1); i++) {
            if(i == 9) {
                $("#row0column" + i).append("<p>OUT</p>");
            } else {
                $("#row0column" + i).append("<p>" + hole + "</p>");
                hole++;
            }
        }

        for(var i = 0, hole = 0; i < (numHoles + 1); i++) {
            if(i != 9) {
                $("#row1column" + i).append("<p class='yards'>" + currCourse.holes[hole].tee_boxes[teetype].yards + "</p>");
                $("#row2column" + i).append("<p class='par'>" + currCourse.holes[hole].tee_boxes[teetype].par + "</p>");
                $("#row3column" + i).append("<p class='handicap'>" + currCourse.holes[hole].tee_boxes[teetype].hcp + "</p>");
                hole++;
            } else {
                $("#row1column" + i).append("<p class='yards'>" + calculateOutYards(teetype) + "</p>");
                $("#row2column" + i).append("<p class='par'>" + calculateOutPar(teetype) + "</p>");
            }
        }

        for(var i = 0, row = 4; i < numName; i++) {
            for(var j = 0, hole = 0; j < (numHoles + 1); j++) {
                if(i % 2 == 0) {
                    $("#row" + row + "column" + j).addClass("column" + j + "even");
                } else {
                    $("#row" + row + "column" + j).addClass("column" + j + "odd");
                }

                if(j != 9) {
                    if(i % 2 == 0) {
                        $("#row" + row + "column" + j).append("<input id='player"+ i +"column"+ j +"' class='scoreInput even' type='text' onkeyup='checkValidation(this.value, this.id)'>");
                        hole++;
                    } else {
                        $("#row" + row + "column" + j).append("<input id='player"+ i +"column"+ j +"' class='scoreInput odd' type='text' onkeyup='checkValidation(this.value, this.id)'>");
                        hole++;
                    }
                }

            }
            row++;
        }
    } else {
        //if whatHole is "back"
        numHoles = 9;
        for(var i = 0; i < (numName + 4); i++){ //hole yards par handicap
            $("#scorecard").append("<div id='row" + i + "' class='row'></div>");
            for(var j = numHoles; j >= 0; j--) {
                $("#row" + i).append("<div id='row" + i + "column" + j +"' class='card row" + i + "'></div>");
            }
        }

        for(var i = 0, hole = 10; i < (numHoles + 1); i++) {
            if(i == 9) {
                $("#row0column" + i).append("<p>IN</p>");
            } else {
                $("#row0column" + i).append("<p>" + hole + "</p>");
                hole++;
            }
        }

        for(var i = 0, hole = 9; i < (numHoles + 1); i++) {
            if(i != 9) {
                $("#row1column" + i).append("<p class='yards'>" + currCourse.holes[hole].tee_boxes[teetype].yards + "</p>");
                $("#row2column" + i).append("<p class='par'>" + currCourse.holes[hole].tee_boxes[teetype].par + "</p>");
                $("#row3column" + i).append("<p class='handicap'>" + currCourse.holes[hole].tee_boxes[teetype].hcp + "</p>");
                hole++;
            } else {
                $("#row1column" + i).append("<p class='yards'>" + calculateOutYards(teetype) + "</p>");
                $("#row2column" + i).append("<p class='par'>" + calculateOutPar(teetype) + "</p>");
            }
        }

        for(var i = 0, row = 4; i < numName; i++) {
            for(var j = 0, hole = 0; j < (numHoles + 1); j++) {
                if(i % 2 == 0) {
                    $("#row" + row + "column" + j).addClass("column" + j + "even");
                } else {
                    $("#row" + row + "column" + j).addClass("column" + j + "odd");
                }

                if(j != 9) {
                    if(i % 2 == 0) {
                        $("#row" + row + "column" + j).append("<input id='player"+ i +"column"+ j +"' class='scoreInput even' type='text' onkeyup='checkValidation(this.value, this.id)'>");
                        hole++;
                    } else {
                        $("#row" + row + "column" + j).append("<input id='player"+ i +"column"+ j +"' class='scoreInput odd' type='text' onkeyup='checkValidation(this.value, this.id)'>");
                        hole++;
                    }
                }

            }
            row++;
        }
    }
}

//---------------------------------------------------------------------------------------
// Lots of functions...
//---------------------------------------------------------------------------------------

function calculateOutYards(teetype) {
    var yards = 0;
    for(var i = 0; i < 9; i++) {
        yards += currCourse.holes[i].tee_boxes[teetype].yards;
    }
    return yards;
}

function calculateInYards(teetype) {
    var yards = 0;
    for(var i = 9; i < 18; i++) {
        yards += currCourse.holes[i].tee_boxes[teetype].yards;
    }
    return yards;
}

function calculateTotalYards(teetype) {
    var yards = 0;
    for(var i = 0; i < 18; i++) {
        yards += currCourse.holes[i].tee_boxes[teetype].yards;
    }
    return yards;
}

function calculateOutPar(teetype) {
    var par = 0;
    for(var i = 0; i < 9; i++) {
        par += currCourse.holes[i].tee_boxes[teetype].par;
    }
    return par;
}

function calculateInPar(teetype) {
    var par = 0;
    for(var i = 9; i < 18; i++) {
        par += currCourse.holes[i].tee_boxes[teetype].par;
    }
    return par;
}

function calculateTotalPar(teetype) {
    var par = 0;
    for(var i = 0; i < 18; i++) {
        par += currCourse.holes[i].tee_boxes[teetype].par;
    }
    return par;
}

function checkValidation(userInput, userId) {
    if(userInput == "") {
        $("#theErrors").html("");
        calculateOutScore();
        calculateInScore();
        calculateTotalScore();
        return true;
    }
    userInput = parseInt(userInput);
    if(!(isNaN(userInput))) {
        if(userInput > 0 && userInput < 100) {
            $("#theErrors").html("");
            calculateOutScore();
            calculateInScore();
            calculateTotalScore();
        } else {
            $("#" + userId).val("");
            $("#theErrors").html("<h2>Number must be from 1-99</h2>");
        }
    } else {
        $("#" + userId).val("");
        $("#theErrors").html("<h2>Please enter a number</h2>");
    }

    function calculateOutScore() {
        var total = 0;
        var playerValue;

        for(var i = 0; i < numName; i++) {
            total = 0;
            for(var j = 0; j < 9; j++) {
                playerValue = $("#player" + i + "column" + j).val();
                playerValue = parseInt(playerValue);
                if(!(isNaN(playerValue))) {
                    total += playerValue;
                }
            }
            $("#row" + (i + 4) + "column9").html("<p class='calculatedScore'>" + total + "</p>");
        }
    }

    function calculateInScore() {
        var total = 0;
        var playerValue;
        for(var i = 0; i < numName; i++) {
            total = 0;
            for(var j = 10; j < 19; j++) {
                playerValue = $("#player" + i + "column" + j).val();
                playerValue = parseInt(playerValue);
                if(!(isNaN(playerValue))) {
                    total += playerValue;
                }
            }
            $("#row" + (i + 4) + "column19").html("<p class='calculatedScore'>" + total + "</p>");
        }
    }

    function calculateTotalScore() {
        var total = 0;
        var playerValue;
        for(var i = 0; i < numName; i++) {
            total = 0;
            for(var j = 0; j < 19; j++) {
                if(j != 9) {
                    playerValue = $("#player" + i + "column" + j).val();
                    playerValue = parseInt(playerValue);
                    if(!(isNaN(playerValue))) {
                        total += playerValue;
                    }
                }
            }
            $("#row" + (i + 4) + "column20").html("<p class='calculatedScore'>" + total + "</p>");
        }
    }
}

//<input type='text' id='inputrow" + i + "column" + j + "'>