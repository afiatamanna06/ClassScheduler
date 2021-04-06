const reader = require('xlsx');
const file = reader.readFile('./input_multi_course_impossible_2.xlsx');
const dayjs = require('dayjs');
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, World!\n');
});

server.listen(port, hostname, () => {
    console.log('Server running at http://' + hostname + ':' + port + '/');
});
let data = []

const sheets = file.SheetNames

for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(
        file.Sheets[file.SheetNames[i]]);

    temp.forEach((res) => {
        data.push(res)

    })
}

var year_timetable = [];
var teacher_timetable = [];
var periodDayjsTime = [];
var lecture = [];
var solutionDomain = [];
var noFlag = false;
var multipleTeacherFlag = false;
const days_in_weeks = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
var TLE = 0;

var unsuccessfulCourses = [];

function initialize() {

    // Here we are setting up a 3d array where 2nd index represent days like
    // Sunday,Monday and 3rd index represents the the period like 8:30, 10:00


    // year base student routines which 
    // are set to 0 that no class is initialized here

    var day_to_check = dayjs("12-25-1995 8:30 am", "MM-DD-YYYY h:mm a");
    periodDayjsTime.push(day_to_check);
    var day_to_check = dayjs("12-25-1995 10:00 am", "MM-DD-YYYY h:mm a");
    periodDayjsTime.push(day_to_check);
    var day_to_check = dayjs("12-25-1995 11:30 am", "MM-DD-YYYY h:mm a");
    periodDayjsTime.push(day_to_check);
    var day_to_check = dayjs("12-25-1995 1:00 pm", "MM-DD-YYYY h:mm a");
    periodDayjsTime.push(day_to_check);
    var day_to_check = dayjs("12-25-1995 2:00 pm", "MM-DD-YYYY h:mm a");
    periodDayjsTime.push(day_to_check);
    var day_to_check = dayjs("12-25-1995 3:30 pm", "MM-DD-YYYY h:mm a");
    periodDayjsTime.push(day_to_check);
    var day_to_check = dayjs("12-25-1995 5:00 pm", "MM-DD-YYYY h:mm a");
    periodDayjsTime.push(day_to_check);


    for (var i = 1; i <= 4; i++) {
        var time_arr = { year: i, Sunday: [0, 0, 0, 0, 0], Monday: [0, 0, 0, 0, 0], Tuesday: [0, 0, 0, 0, 0], Wednesday: [0, 0, 0, 0, 0], Thursday: [0, 0, 0, 0, 0] };
        year_timetable.push(time_arr);
    }


    var teachers_info = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);

    for (var i = 0; i < teachers_info.length; i++) {
        var time_arr = { Teacher: teachers_info[i]['Teacher Initial'], Sunday: [0, 0, 0, 0, 0], Monday: [0, 0, 0, 0, 0], Tuesday: [0, 0, 0, 0, 0], Wednesday: [0, 0, 0, 0, 0], Thursday: [0, 0, 0, 0, 0] };
        teacher_timetable.push(time_arr);
    }
    var teachers_free_time_info = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[2]]);

    for (var i = 0; i < teachers_free_time_info.length; i++) {
        var name = teachers_free_time_info[i].Teacher;
        for (days in days_in_weeks) {
            var str = teachers_free_time_info[i][days_in_weeks[days]]
            if (typeof(str) == "string") str = str.split(";");
            for (time in str) {
                var SE_time = str[time].split("-");
                teacherPeriodPlotter(name, days_in_weeks[days], SE_time[0], SE_time[1]);
            }
        }

    }
}

initialize();

function teacherPeriodPlotter(teachersName, days, startTime, endTime) {
    startTime = startTime.replace("am", " am");
    startTime = startTime.replace("pm", " pm");
    endTime = endTime.replace("am", " am");
    endTime = endTime.replace("pm", " pm");
    var s_time = dayjs("12-25-1995 " + startTime, "MM-DD-YYYY h:mm a");
    var e_time = dayjs("12-25-1995 " + endTime, "MM-DD-YYYY h:mm a");
    for (var i = 0; i < periodDayjsTime.length - 1; i++) {
        if ((periodDayjsTime[i].isAfter(s_time) || periodDayjsTime[i].isSame(s_time)) && (periodDayjsTime[i + 1].isBefore(e_time) || periodDayjsTime[i + 1].isSame(e_time))) {

            for (j in teacher_timetable) {
                if (teacher_timetable[j].Teacher == teachersName) {

                    if (i <= 2) teacher_timetable[j][days][i] = 1;
                    else if (i > 3) teacher_timetable[j][days][i - 1] = 1;
                }
            }
        }
    }
}

var courses = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[1]]);

for (var i in courses) {
    for (var key in courses[i]) {
        if (courses[i].hasOwnProperty(key)) {
            // console.log(key);
            var val = courses[i][key];
            // console.log(courses[i]["Teacher Initial"]);
            if (key != "Teacher Initial") {
                lectureMaker(val, courses[i]["Teacher Initial"]);
                // console.log(val);
            }
        }
    }
}

function lectureMaker(input, teacher) {
    for (var i in lecture) {
        if (lecture[i].courseName == input) {
            lecture[i].teacher.push(teacher);
            return;
        }
    }
    var courseStr = { courseName: "", year: "", teacher: [], isLabCourse: false, section: 0 };
    courseStr.courseName = input;
    courseStr.teacher.push(teacher);

    var splittedStr = input.split(" ");
    courseStr.year = parseInt(splittedStr[1][0]);
    if (splittedStr[1][2] == "1") courseStr.isLabCourse = true;
    if (splittedStr.length > 2) {
        courseStr.section = parseInt(splittedStr[3]);
    }


    if (!courseStr.isLabCourse) {
        lecture.push(courseStr);
        lecture.push(courseStr);
    } else {
        lecture.push(courseStr);
    }

}

CSP(lecture)

function CSP(domain) {
    const totalNumberofLectures = domain.length;
    var ind = 0;
    var chosenLecture;
    while (domain.length != 0) {
        chosenLecture = selectLecture(domain);
        if (chosenLecture == null) {
            ind = ind - 1;
            if (ind < 0) {
                console.log("No Solution");
                return;
            }

            TLE = TLE + 1;

            console.log("----------------index of Lecture-----------");
            console.log(ind);
            console.log("unassign e dhukse");
            console.log("----------------DOmain Length---------------------");
            console.log(domain.length);

            var falseCourse = solutionDomain.pop();

            unsuccessfulCourses.push(falseCourse.choosingCourse);

            console.log("----------------False Course---------------------");
            console.log(falseCourse);

            var batch = falseCourse.year;
            var day = falseCourse.chosenDay;
            var index = falseCourse.period;
            if (!falseCourse.choosingCourse.isLabCourse) {
                var teacherIndex = falseCourse.teacherInd;

                teacher_timetable[teacherIndex][day][index] = 1;
                year_timetable[batch - 1][day][index] = 0;
            } else {
                var teacherIndex = falseCourse.multiTeacherIndex;
                for (var t_index in teacherIndex) {
                    teacher_timetable[teacherIndex[t_index]][day][index + 1] = 1;
                    teacher_timetable[teacherIndex[t_index]][day][index] = 1;
                }
                year_timetable[batch - 1][day][index + 1] = 0;
                year_timetable[batch - 1][day][index] = 0;

            }

        } else {

            console.log("--------------eta Choose hoise---------");
            console.log(ind);
            console.log(chosenLecture);
            solutionDomain.push(chosenLecture);
            ind = ind + 1;
            var len = solutionDomain.length;
            console.log(ind);
        }
    }
}