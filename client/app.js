import React, { useEffect, useRef, useState } from 'react'
import { render } from 'react-dom'
import Table from 'react-bootstrap/Table'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import "./style.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import { toInteger } from 'lodash-es';

var server = new WebSocket("wss://blueserver.us.to:26950/");
//var server = new WebSocket("wss://47.184.193.193:26950/");

let [month, date, year] = new Date().toLocaleDateString("en-US").split("/");
let day = new Date().getDay();
let [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /);
hour = new Date().getHours();

let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let timeHeight = 150;


server.onopen = (e) => {
    console.log(e);
    var mess = {
        type: "getWeek",
        month: month,
        week: Math.floor(date / 7),
        date: date,
        year: year
    }
    //console.log(mess);
    server.send(JSON.stringify(mess));
}

server.onmessage = (message) => {
    message = JSON.parse(message.data);
    console.log(message)

    if (message.type = "week") {
        if (message.data) {
            weeklyMeetings = message.data;
        } else {
            weeklyMeetings = [];
        }
        
    }
    /*
    console.log(message)
    if (message.week == week) {
        console.log("thisweek");
    }*/
}

function createServerTask(e) {
    e.preventDefault();
    console.log(e);
    document.getElementById("createTask").style.display = "none";
    var JSONpackage = {
        subject: document.getElementById("createSubject").value,
        date: document.getElementById("createDate").value,
        time: document.getElementById("createTime").value,
        text: document.getElementById("createTitle").value,
        attendees: "Bryant",
        len: document.getElementById("createLength").value
    }
    var moveable = {
        type: "createTask",

        data: JSONpackage
    }
    server.send(JSON.stringify(moveable));
}

// Storage for tutorials 

let week = Math.floor(date / 7);
let weeklyMeetings = []

let subjectStyles = {
    CS: {
        border: "transparent",
        background: "rgba(30, 132, 227, 0.5)"
    },
    default: {
        border: "transparent",
        background: "rgba(255, 251, 0, 0.5)"
    }
}

var selectedDate;
var selectedTime;

function CreateTask(props) {

    const [current, setCurrent] = useState(selectedDate);

    var container = {
        "position": "fixed",
        "width": "100vw",
        "height": "100vh",
        "top": "0",
        "left": "0",
        "backgroundColor": "rgba(0, 0, 0, 0.5)",
        "zIndex": "200",
        "display": "none"
    }

    var style = {
        "width": "500px",
        "height": "auto",
        "backgroundColor": "rgb(25, 25, 25)",
        "margin": "20vh auto",
        "padding": "40px",
        "borderRadius": "20px",
        "color": "white"
    }

    return (
        <div style={container} id="createTask" onClick={function (e) {
            if (e.target.id == "createTask")
                document.getElementById("createTask").style.display = "none";
        }}>
            <div style={style} id="form">
                <h5>Schedule a meeting!</h5>
                <br />
                <Form onSubmit={createServerTask}>
                    <Form.Row>
                        <Form.Group>
                            <Form.Label>Subject</Form.Label>
                            <Form.Control type="text" id="createSubject" placeholder="Class" />
                        </Form.Group>
                        <Form.Group style={{ marginLeft: "2%" }}>
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="textarea" id="createTitle" placeholder="Brief Overview" />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row>
                        <Form.Group>
                            <Form.Label>Date</Form.Label>
                            <Form.Control type="date" id="createDate" />
                        </Form.Group>
                        <Form.Group style={{ marginLeft: "2%" }}>
                            <Form.Label>Time</Form.Label>
                            <Form.Control type="time" id="createTime" />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row>
                        <Form.Group>
                            <Form.Label>Length</Form.Label>
                            <Form.Control as="select" id="createLength">
                                <option value="15">00:15</option>
                                <option value="30">00:30</option>
                                <option value="45">00:45</option>
                                <option value="60">01:00</option>
                                <option value="75">01:15</option>
                                <option value="90">01:30</option>
                                <option value="105">01:45</option>
                                <option value="120">02:00</option>
                            </Form.Control>

                        </Form.Group>
                        <Form.Group style={{ marginLeft: "2%" }}>
                            <Form.Label style={{ color: "transparent" }}> uwu </Form.Label>
                            <br />
                            <Button type="submit">Submit form</Button>
                        </Form.Group>
                    </Form.Row>
                </Form>
            </div>
        </div>
    )
}

function Task(props) {

    console.log(props.meeting)
    console.log(timeHeight * (props.meeting.len / 60) + "px")

    var sub;

    if (subjectStyles[props.meeting.subject]) {
        sub = subjectStyles[props.meeting.subject];
    } else {
        sub = subjectStyles.default;
    }

    var style = {
        "backgroundColor": sub.background,
        "display": "block",
        "height": timeHeight * (props.meeting.len / 60) - 3 + "px",
        "borderRadius": "10px",
        "border": "2px " + sub.border + " solid",
        "overflow": "auto"
    }



    return (
        <div style={style} className="task">
            <p>{props.meeting.text}</p>
            <div>
                <p>Attendees:</p>
                <p>{props.meeting.attendees}</p>
            </div>
        </div>
    )
}

function Hour(props) {

    var text = "";
    var id = "";

    console.log(weeklyMeetings);
    for (var i = 0; i < weeklyMeetings.length; i++) {
        //console.log(props.hour + " " + weeklyMeetings[i].time);
        if (props.date == parseInt(weeklyMeetings[i].date.split("-")[2]) && props.hour == weeklyMeetings[i].time.substr(0,2)) {
            //console.log("asjhfxzkjlcvh");
            text = <Task meeting={weeklyMeetings[i]} />
        }
    }

    function selectHour(e) {
        if (click > 100 || moving) {
            console.log("moving");
        }
        else {
            console.log("not moving")
            document.getElementById("createTask").style.display = "block";
            document.getElementById("createDate").value = "2021-03-" + props.date;
            document.getElementById("createTime").value = props.hour + ":00";
        }
    }

    return (
        <div className="hour" id={id} onClick={selectHour}>
            {text}
        </div>
    )
}

function Header(props) {

    return (
        <Table borderless>
            <thead>
                <tr className="headers">
                    <td className="empty header">12 PM</td>
                    {Array.from({ length: 7 }).map((_, index) => {
                        var num = props.date - day + index;
                        return <td key={index} className="header">
                            <h6>{num}</h6> {days[index]}
                        </td>
                    })}
                </tr>
            </thead>
        </Table>
    )
}

function Week(props) {

    const [meetings, setMeetings] = useState(weeklyMeetings);

    var interval;

    function reset() {
        clearInterval(interval);
        interval = null;
        setMeetings(weeklyMeetings);
        console.log(weeklyMeetings);
    }

    useEffect(() => {
        reset();
        interval = setInterval(() => {
            if (meetings != weeklyMeetings) {
                reset();
            }
        }, 1000);
    })

    return (
        <div className="week">
            <Header date={props.date} />
            <div className="schedule" onMouseDown={swipe} id="schedule">
                <div id={"currentTime"} className="currentTime" />
                <Table bordered hover>
                    <tbody>
                        {Array.from({ length: 14 }).map((_, index) => {
                            var num = index + 8;
                            var time = num;

                            if (num == 12) {
                                num = 12 + " PM";
                            } else if (num / 12 > 1) {
                                num = num % 12 + " PM";
                            }
                            else {
                                num = num + " AM"
                            }

                            var id = "";

                            //console.log(hour + " " + time);
                            if ((props.date == date && parseInt(hour) == time) || (hour >= 21 && time == 20)) {
                                id = "scroll";
                            }

                            return <tr key={index} id={id} style={{ height: "auto" }}>

                                <td key={index} className="times" id="blue">
                                    {(num)}
                                </td>
                                {Array.from({ length: 7 }).map((_, index) => {
                                    var num = props.date - day + index;

                                    if (num == props.date)
                                        return <td key={index} className="highlighted"><Hour date={num} hour={time} /></td>
                                    return <td key={index}><Hour date={num} hour={time} /></td>
                                })}
                            </tr>
                        })}

                    </tbody>
                </Table>
            </div>
        </div>
    );
}

function UI(props) {

    var container = {
        "width": "95vw",
        "minWidth": "1000px",
        "height": "100vh",
        "paddingTop": "5vh",
        "margin": "auto",
        "overflow": "hidden"
    }

    return (<div style={container}>
        <div>
            <h1>Schedule</h1>
        </div>
        <CreateTask />
        <Week date={date} />
    </div>)
}

var mouse = null;
var moving = false;
var prev = [0, 0];
function swipe(e) {
    mouse = [e.clientX, e.clientY];
    prev[0] = document.getElementById("schedule").scrollLeft;
    prev[1] = document.getElementById("schedule").scrollTop;
    //console.log(e);
}

render(
    <>
        <UI />
    </>,
    document.getElementById("root")
);

var interval;
var click = 0;

document.onmouseup = function (e) {
    if (mouse && mouse[0] - e.clientX < 5 && mouse[1] - e.clientY < 5) {
        moving = false;
    }
    mouse = null;
    clearInterval(interval);
    interval = null;
}

document.onmousedown = function () {
    click = 0;
    clearInterval(interval);
    interval = null;
    interval = setInterval(function () {
        click++;
    }, 1);
}

document.onmousemove = function (e) {
    moving = true;
    if (mouse != null) {
        //console.log((e.clientX - mouse[0]) + " " + (e.clientY - mouse[1]))
        if (Math.abs(e.clientX - mouse[0]) > Math.abs(e.clientY - mouse[1])) {
            document.getElementById("schedule").scroll(-1 * (e.clientX - mouse[0]) + prev[0], prev[1]);
        }
        else {
            document.getElementById("schedule").scroll(prev[0], -1 * (e.clientY - mouse[1]) + prev[1]);
        }
    }
}

setInterval(() => {

    hour = new Date().getHours();
    second = new Date().getSeconds();
    minute = new Date().getMinutes();

    /*
    if (document.getElementById("scroll")) {
                console.log("schedule: " + document.getElementById("schedule").scrollTop);
        console.log("scroll: " + document.getElementById("scroll").offsetTop);
    }*/
    //console.log(timeHeight)



    var hourDist = (hour - 8) * timeHeight;
    var minDist = (minute / 60) * timeHeight;
    var secDist = (timeHeight / 60) * (second / 60);

    var totalDist = (hourDist + minDist + secDist);
    if (hour >= 21) {
        totalDist = 14 * timeHeight;
    } else if (hour < 8) {
        totalDist = 0;
    }



    //console.log(hourDist / timeHeight + "%");

    //moveCurrentTime(totalDist);
    document.getElementById("currentTime").style.top = totalDist + "px";
    //console.log(document.getElementById("currentTime").style.top);

}, 100);

function moveCurrentTime(totalDist) {

    var current = parseInt(document.getElementById("currentTime").style.top.substr(0, document.getElementById("currentTime").style.top.length - 2));

    if (!current) {
        document.getElementById("currentTime").style.top = "0px";
    }

    var distance = totalDist - current;

    //console.log(distance);
    if (distance <= 1) {
        document.getElementById("currentTime").style.top = totalDist + "px";
        return;
    }
    document.getElementById("currentTime").style.top = current + (distance / 40) + "px";
}

setTimeout(() => {
    var myElement = document.getElementById('scroll');
    var topPos = myElement.offsetTop - timeHeight;

    document.getElementById('schedule').scrollTo({
        top: topPos,
        behavior: "smooth"
    });

    timeHeight = document.getElementById("scroll").offsetHeight;

    document.getElementById("currentTime").style.opacity = "1";
    document.getElementById("currentTime").classList.add("currentTimeAnim");
    //console.log(document.getElementById("currentTime").classList);

}, 1000);