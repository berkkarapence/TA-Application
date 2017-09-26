'use strict';

var fs = require('fs');

let courseObject;
let taObject;

fs.readFile('courses.json', 'utf-8', function(err, data) {
    if(err) {
        throw err;
    }
    courseObject = JSON.parse(data);
});

fs.readFile('tas.json', 'utf-8', function(err, data) {
    if(err) {
        throw err;
    }
    taObject = JSON.parse(data);
});


exports.findAllApplicants = function(req, res) {

    let response = {};
    let statusArray = [];
    let nameArray = [];

    // make a copy of taObject (to avoid aliasing when modifiying the object to remove courses from it)
    let copiedTaObject = JSON.parse(JSON.stringify(taObject));

    // we don't want to include courses when we get the applicant list (except for a query with fname)
    for(let i in copiedTaObject['tas']){
        if(copiedTaObject['tas'][i] != null) {
            delete copiedTaObject['tas'][i]["courses"];
        }
    }

    if(req.query.status == null && req.query.fname == null) {
        // get all the applicants
        response = copiedTaObject;
        response.tas.sort(function(a, b) {
            if(a.familyname.toLowerCase() == b.familyname.toLowerCase()) {
                return 0;
            }
            return a.familyname.toLowerCase() > b.familyname.toLowerCase() ? 1 : -1;
        });
    }

    // there is a status query
    if(req.query.status != null && req.query.fname == null) {
        for(let k in copiedTaObject['tas']){
            if(copiedTaObject['tas'][k] != null) {
                if(copiedTaObject['tas'][k]["status"] == req.query.status) {
                    statusArray.push(copiedTaObject['tas'][k]);
                    response = statusArray;
                }
                else {
                    if(statusArray.length < 1) {
                        response = "No status matched with " + req.query.status;
                    }
                }
            }
        }
    }

    // there is a fname query
    if(req.query.status == null && req.query.fname != null) {
        for(let n in taObject['tas']){
            if(taObject['tas'][n] != null) {
                if(taObject['tas'][n]["familyname"] == req.query.fname) {
                    nameArray.push(taObject['tas'][n]);
                    response = nameArray;
                }
                else {
                    // if there is no matching --> nameArray is empty or nameArray.length == 0
                    if(nameArray.length < 1){
                        response = "No given name matched with " + req.query.fname;
                    }
                }
            }
        }
    }
    res.send(response);
}


exports.addApplicant = function(req, res) {

    let response = "";
    let newTa = req.body;
    let duplicate = false;

    for(let ta in taObject.tas) {
        if(taObject.tas[ta]["stunum"] == req.body.stunum) {
            // duplicate student number
            duplicate = true;
        }
        else {
            duplicate = false;
        }
    }

    if(duplicate) {
        console.log("There exists a TA with student number: " + req.body.stunum);
        response = "Error";
    }
    else {
        response = "Success";
        taObject.tas.push(newTa);
    }

    res.send(response);
}

exports.removeApplicant = function(req, res) {

    let response = "";
    let matchedName = 0;

    // Remove applicant by family name
    if(req.query.fname != null) {
        let fname = req.query.fname;
        for(let ta in taObject.tas) {
            // If there is a TA with family name fname
            if(taObject.tas[ta]["familyname"] == fname) {
                matchedName++;
                taObject.tas.splice(taObject.tas.indexOf(taObject.tas[ta]), 1);
                //delete taObject.tas[ta];
                response = "Success";
            }
            else {
                // No such student
                if(matchedName == 0) {
                    console.log("No such student exists.")
                    response = "Error";
                }
            }
        }
    }

    let matchedStatus = 0;

    // Remove applicant by student number
    if(req.query.stunum != null) {
        let stunum = req.query.stunum;
        for(let t in taObject.tas) {
            // If there is a TA with student number stunum
            if(taObject.tas[t]["stunum"] == stunum) {
                matchedStatus++;
                taObject.tas.splice(taObject.tas.indexOf(taObject.tas[t]), 1);
                //delete taObject.tas[t];
                response = "Success";
            }
            else {
                // No such student
                if(matchedStatus == 0) {
                    console.log("No such student exists.")
                    response = "Error";
                }
            }
        }
    }

    console.log("Success");
    res.send(response);
}


exports.getCourses = function(req, res) {

    let taList = taObject.tas;
    let taCourses = [];
    let courseArray = courseObject.courses;
    let responses = { "courses" : []};


    // there is no query
    if(req.query.course == null) {
        for(let k in courseArray) {
            let response = {
                        "code" : courseArray[k],
                        "tas" : []
                };
                for(let l in taList) {
                    for(let code in taList[l]["courses"]) {
                        if(taList[l]["courses"][code]["code"] == courseArray[k]) {
                            let ta = {
                                "stunum" : taList[l]["stunum"],
                                "givenname": taList[l]["givenname"],
                                "familyname": taList[l]["familyname"],
                                "status": taList[l]["status"],
                                "year": taList[l]["year"],
                                "rank": taList[l]["courses"][code]["rank"],
                                "experience": taList[l]["courses"][code]["experience"]
                            };
                            response["tas"].push(ta);
                            // sort courses in ascending order
                            response.tas.sort(function(a, b) {
                                if(a.rank == b.rank) {
                                    return 0;
                                }
                                return a.rank > b.rank ? 1 : -1;
                            });
                        }

                    }
                }
                responses["courses"].push(response);

            }
    }
    // there is a query --> ?course=course
    else {
        for(let k in courseArray) {
            if(courseArray[k] == req.query.course) {
                let response = {
                            "code" : req.query.course,
                            "tas" : []
                    };
                for(let l in taList) {
                    for(let code in taList[l]["courses"]) {
                        if(taList[l]["courses"][code]["code"] == courseArray[k]) {
                            let ta = {
                                "stunum" : taList[l]["stunum"],
                                "givenname": taList[l]["givenname"],
                                "familyname": taList[l]["familyname"],
                                "status": taList[l]["status"],
                                "year": taList[l]["year"],
                                "rank": taList[l]["courses"][code]["rank"],
                                "experience": taList[l]["courses"][code]["experience"]
                            };
                            response["tas"].push(ta);
                            // sort courses in ascending order
                            response.tas.sort(function(a, b) {
                                if(a.rank == b.rank) {
                                    return 0;
                                }
                                return a.rank > b.rank ? 1 : -1;
                            });
                        }
                    }
                }
                responses["courses"].push(response);
            }
        }
    }
    res.send(responses);
}
