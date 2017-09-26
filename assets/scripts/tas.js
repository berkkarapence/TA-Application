'use strict';

// Column Names for the tables
let tableColumnNames = ["Given Name", "Family Name", "Status", "Year"];
let familyNameColumnNames = ["Student Number", "Given Name", "Family Name",
                            "Status", "Year", "Courses", "Ranking", "Experience"];
let statusList = ["Undergrad", "MSc", "PhD", "MScAC", "MEng"];
let courseColumns = ["Ranking", "Experience", "Status", "Given Name", "Family Name"];

// Build Tables here
function buildTable() {
    let table = document.getElementById("allapplicants");
    let tableColumnLength = table.rows[0].cells.length;

    for(let k = 0; k < tableColumnLength; k++) {
        table.rows[0].cells[k].innerHTML = tableColumnNames[k];
    }
}

function buildStatusTable() {
    let table = document.getElementById("statustable");
    let tableColumnLength = table.rows[0].cells.length;

    for(let k = 0; k < tableColumnLength; k++) {
        table.rows[0].cells[k].innerHTML = tableColumnNames[k];
    }
}

function buildFamilyNameTable() {
    let table = document.getElementById("fnametable");
    let tableColumnLength = table.rows[0].cells.length;

    for(let k = 0; k < tableColumnLength; k++) {
        table.rows[0].cells[k].innerHTML = familyNameColumnNames[k];
    }
}

function buildCourseTable() {
    let table = document.getElementById("coursetable");
    let tableColumnLength = table.rows[0].cells.length;

    for(let k = 0; k < tableColumnLength; k++) {
        table.rows[0].cells[k].innerHTML = courseColumns[k];
    }
}

function buildSearchCourseTable() {
    let table = document.getElementById("searchcoursetable");
    let tableColumnLength = table.rows[1].cells.length;

    for(let k = 0; k < tableColumnLength; k++) {
        table.rows[1].cells[k].innerHTML = courseColumns[k];
    }
}

// Generating Statuses for finding TA from status
function generateStatuses() {
    let select = document.getElementById("selectstatus");
    let selectAStatus = document.createElement("option");
    selectAStatus.value = "selectastatus";
	selectAStatus.textContent = "Select a Status";
	selectAStatus.selected = true;
	selectAStatus.disabled = true;
    select.appendChild(selectAStatus);
    for(let k = 0; k < statusList.length; k++) {
        let option = document.createElement("option");
        option.value = statusList[k];
        option.textContent = statusList[k];
        option.id = statusList[k];
        select.appendChild(option);
    }
}

$(document).ready(function() {

    generateStatuses();

    $("#getapplicants").submit(function (e) {
        e.preventDefault();
        getApplicants();
        refreshTable();
    });

    $("#getfromstatus").submit(function (e) {
        e.preventDefault();
        getApplicantsFromStatus();
        refreshStatusTable();
    });

    $("#getfromfamilyname").submit(function (e) {
        e.preventDefault();
        getApplicantsFromFamilyName();
        refreshFamilyNameTable();
    });

    $("#add").submit(function (e) {
        e.preventDefault();
        let stunum = $('#newstunum').val();
        let givenName = $('#newgivenname').val();
        let familyName = $('#newfamilyname').val();
        let status = $('#newstatus').val();
        let year = $('#newyear').val();
        let courses = [$('#newcourses').val()];
        if(stunum == "" || givenName == "" || familyName == ""
            || status == "" || year == "") {
            alert("Please complete the form");
        }

        $.ajax({
            url: '/applicants/',
            type: 'POST',
            data: {
                "stunum": stunum,
                "givenname": givenName,
                "familyname": familyName,
                "status": status,
                "year": year,
                "courses": courses
            },
            success: function() {
                location.reload(true);
            }
        });
    });


    $("#removebystunum").submit(function (e) {
        e.preventDefault();
        let stunum = $('#delstunum').val();
        if(stunum == "") {
            alert("Please enter a number");
        }
        $.ajax({
            url: '/applicants/' + "?stunum=" + stunum,
            type: 'DELETE',
            success: function(data) {
                if(data != "Success") {
                    alert("There doesn't exist a TA with student number: " + stunum);
                }
                location.reload(true);
            }
        });

    });

    $("#removebyfname").submit(function (e) {
        e.preventDefault();
        let fname = $('#delfname').val();
        if(fname == "") {
            alert("Please type the family name of the TA");
        }
        $.ajax({
            url: '/applicants/' + "?fname=" + fname,
            type: 'DELETE',
            success: function(data) {
                if(data != "Success") {
                    alert("There doesn't exist a TA with family name: " + fname);
                }
                location.reload(true);
            }
        });

    });

    $("#getcourses").submit(function (e) {
        e.preventDefault();
        getCourses();
        refreshCourseTable();
    });

    $("#searchcourse").submit(function (e) {
        e.preventDefault();
        let courseId = $('#coursecode').val();
        if(courseId == "") {
            alert("Please type something.");
        }
        getSearchedCourse();
        refreshSearchCourseTable();
    });


    function getApplicants() {
        let tableId = document.getElementById("allapplicants");
        $.ajax({
          url: "/applicants",
          type: "GET",
          success: function(data) {
              buildTable();
              populateTable(data);
          }
        });
    }

    function getApplicantsFromStatus() {
        let status = document.getElementById("selectstatus").value;
        $.ajax({
            url: '/applicants/' + "?status=" + status,
            type: 'GET',
            success: function(data) {
                buildStatusTable();
                populateStatusTable(data);
            }
        });
    }

    function getApplicantsFromFamilyName() {
        let familyName = document.getElementById("tafname").value;
        $.ajax({
            url: '/applicants/' + "?fname=" + familyName,
            type: 'GET',
            success: function(data) {
                buildFamilyNameTable();
                populateFamilyNameTable(data);
            }
        });
    }

    function getCourses() {
        $.ajax({
            url: '/courses/',
            type: 'GET',
            success: function(data) {
                buildCourseTable();
                populateCourseTable(data);
            }
        });
    }

    function getSearchedCourse() {
        let courseId = document.getElementById("coursecode").value;
        $.ajax({
            url: '/courses/' + "?course=" + courseId,
            type: 'GET',
            success: function(data) {
                buildSearchCourseTable();
                populateSearchCourseTable(data);
            }
        });
    }


    function populateTable(data) {

        let taArray = [];
        let table = document.getElementById("allapplicants");
        table.style.visibility = "visible";
        let rowCount = table.rows.length;

        for(let i = 0; i < data.tas.length; i++) {
            let row = table.insertRow(rowCount);
            let cell0 = row.insertCell(0);
            let cell1 = row.insertCell(1);
            let cell2 = row.insertCell(2);
            let cell3 = row.insertCell(3);
            table.rows[rowCount].cells[0].innerHTML = data.tas[i].givenname;
            table.rows[rowCount].cells[1].innerHTML = data.tas[i].familyname;
            table.rows[rowCount].cells[2].innerHTML = data.tas[i].status;
            table.rows[rowCount].cells[3].innerHTML = data.tas[i].year;
            rowCount++;
        }
    }

    function populateStatusTable(data) {
        let status = document.getElementById("selectstatus").value;
        let table = document.getElementById("statustable");
        table.style.visibility = "visible";
        let rowCount = table.rows.length;
        for(let i = 0; i < data.length; i++) {
            if(data[i].status == status) {
                let row = table.insertRow(rowCount);
                let cell0 = row.insertCell(0);
                let cell1 = row.insertCell(1);
                let cell2 = row.insertCell(2);
                let cell3 = row.insertCell(3);
                table.rows[rowCount].cells[0].innerHTML = data[i].givenname;
                table.rows[rowCount].cells[1].innerHTML = data[i].familyname;
                table.rows[rowCount].cells[2].innerHTML = data[i].status;
                table.rows[rowCount].cells[3].innerHTML = data[i].year;
                rowCount++;
            }
        }
    }

    function populateFamilyNameTable(data) {
        let familyName = document.getElementById("tafname").value;
        let table = document.getElementById("fnametable");
        let courseArray = [];
        table.style.visibility = "visible";
        let rowCount = table.rows.length;
        for(let i = 0; i < data.length; i++) {
            if(data[i].familyname == familyName) {
                let row = table.insertRow(rowCount);
                let cell0 = row.insertCell(0);
                let cell1 = row.insertCell(1);
                let cell2 = row.insertCell(2);
                let cell3 = row.insertCell(3);
                let cell4 = row.insertCell(4);
                let cell5 = row.insertCell(5);
                let cell6 = row.insertCell(6);
                let cell7 = row.insertCell(7);
                table.rows[rowCount].cells[0].innerHTML = data[i].stunum;
                table.rows[rowCount].cells[1].innerHTML = data[i].givenname;
                table.rows[rowCount].cells[2].innerHTML = data[i].familyname;
                table.rows[rowCount].cells[3].innerHTML = data[i].status;
                table.rows[rowCount].cells[4].innerHTML = data[i].year;
                for(let j in data[i].courses) {
                    courseArray.push(data[i].courses[j].code);
                    table.rows[rowCount].cells[6].innerHTML = data[i].courses[j].code +
                                                            ": " + data[i].courses[j].rank;
                    table.rows[rowCount].cells[7].innerHTML = data[i].courses[j].code +
                                                            ": " + data[i].courses[j].experience;
                }
                table.rows[rowCount].cells[5].innerHTML = courseArray;
                rowCount++;
            }
        }
    }


    function populateCourseTable(data) {
        let table = document.getElementById("coursetable");
        table.style.visibility = "visible";
        let rowCount = table.rows.length;
        // for(let i in data.courses) {
        //     let position = 0;
        //     let courseRow = table.insertRow(position);
        //     let courseCell = courseRow.insertCell(0);
        //     table.rows[position].cells[0].innerHTML = data.courses[i].code;
        //     for(let k = 0; k < data.courses[i].tas.length; k++){
        //         console.log("buraya gisdsdrdim");
        //         let row = table.insertRow(rowCount);
        //         let cell0 = row.insertCell(0);
        //         let cell1 = row.insertCell(1);
        //         let cell2 = row.insertCell(2);
        //         let cell3 = row.insertCell(3);
        //         let cell4 = row.insertCell(4);
        //         table.rows[rowCount].cells[0].innerHTML = data.courses[i].tas[k].rank;
        //         table.rows[rowCount].cells[1].innerHTML = data.courses[i].tas[k].experience;
        //         table.rows[rowCount].cells[2].innerHTML = data.courses[i].tas[k].status;
        //         table.rows[rowCount].cells[3].innerHTML = data.courses[i].tas[k].givenname;
        //         table.rows[rowCount].cells[4].innerHTML = data.courses[i].tas[k].familyname;
        //         rowCount++;
        //         position = position + data.courses[i].tas.length;
        //         console.log(position)
        //     }
        // }
        for(let i in data.courses) {
            //table.rows[0].cells[0].innerHTML = data.courses[i].code;
            for(let k = 0; k < data.courses[i].tas.length; k++){
                let row = table.insertRow(rowCount);
                let cell0 = row.insertCell(0);
                let cell1 = row.insertCell(1);
                let cell2 = row.insertCell(2);
                let cell3 = row.insertCell(3);
                let cell4 = row.insertCell(4);
                table.rows[rowCount].cells[0].innerHTML = data.courses[i].tas[k].rank;
                table.rows[rowCount].cells[1].innerHTML = data.courses[i].tas[k].experience;
                table.rows[rowCount].cells[2].innerHTML = data.courses[i].tas[k].status;
                table.rows[rowCount].cells[3].innerHTML = data.courses[i].tas[k].givenname;
                table.rows[rowCount].cells[4].innerHTML = data.courses[i].tas[k].familyname;
                rowCount++;
            }
        }

    }


    function populateSearchCourseTable(data) {
        let table = document.getElementById("searchcoursetable");
        let courseId = document.getElementById("coursecode").value;
        table.style.visibility = "visible";
        let rowCount = table.rows.length;
        for(let i in data.courses) {
            table.rows[0].cells[0].innerHTML = data.courses[i].code;
            if(data.courses[i].code == courseId){
                for(let k = 0; k < data.courses[i].tas.length; k++){
                    let row = table.insertRow(rowCount);
                    let cell0 = row.insertCell(0);
                    let cell1 = row.insertCell(1);
                    let cell2 = row.insertCell(2);
                    let cell3 = row.insertCell(3);
                    let cell4 = row.insertCell(4);
                    table.rows[rowCount].cells[0].innerHTML = data.courses[i].tas[k].rank;
                    table.rows[rowCount].cells[1].innerHTML = data.courses[i].tas[k].experience;
                    table.rows[rowCount].cells[2].innerHTML = data.courses[i].tas[k].status;
                    table.rows[rowCount].cells[3].innerHTML = data.courses[i].tas[k].givenname;
                    table.rows[rowCount].cells[4].innerHTML = data.courses[i].tas[k].familyname;
                    rowCount++;
                }
            }
        }

    }

    function refreshTable() {
        let button = document.getElementById("list");
        button.onclick = function() {
            $("#allapplicants").find("tr:gt(0)").remove();
        }
    }

    function refreshStatusTable() {
        let button = document.getElementById("statusbutton");
        button.onclick = function() {
            $("#statustable").find("tr:gt(0)").remove();
        }
    }

    function refreshFamilyNameTable() {
        let button = document.getElementById("fnamebutton");
        button.onclick = function() {
            $("#fnametable").find("tr:gt(0)").remove();
        }
    }

    function refreshCourseTable() {
        let button = document.getElementById("coursebutton");
        button.onclick = function() {
            $("#coursetable").find("tr:gt(1)").remove();
        }
    }

    function refreshSearchCourseTable() {
        let button = document.getElementById("coursesearchbutton");
        button.onclick = function() {
            $("#searchcoursetable").find("tr:gt(1)").remove();
        }
    }

    /*
    function addRow() {

        var table = document.getElementById("allapplicants");

        var rowCount = table.rows.length;
        var row = table.insertRow(rowCount);
    }
    */

});
