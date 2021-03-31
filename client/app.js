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


import camera from "./img/camera.png";
import mic from "./img/mic.png";
import call from "./img/call.png";
import end from "./img/end.png";
import back from "./img/back.png";


import webrtc from "./webrtc";

var server = new WebSocket("wss://blueserver.us.to:26950/");
//var server = new WebSocket("wss://47.184.193.193:26950/");

let [month, date, year] = new Date().toLocaleDateString("en-US").split("/");
let day = new Date().getDay();
let [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /);
hour = new Date().getHours();

let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let timeHeight = 150;

var loading = false;




server.onopen = (e) => {
    var mess = {
        type: "getWeek",
        month: month,
        week: Math.floor(date / 7),
        date: date,
        year: year
    }
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

    function createServerTask(e) {
        e.preventDefault();
        document.getElementById("createTask").style.display = "none";
        var JSONpackage = {
            subject: document.getElementById("createSubject").value,
            date: document.getElementById("createDate").value,
            time: document.getElementById("createTime").value,
            text: document.getElementById("createTitle").value,
            attendees: "Guest",
            len: document.getElementById("createLength").value
        }
        var moveable = {
            type: "createTask",

            data: JSONpackage
        }
        server.send(JSON.stringify(moveable));
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

var selectedMeeting;
function EditTask(props) {

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

    function editServerTask(e) {
        document.getElementById("editTask").style.display = "none";
        e.preventDefault();
        document.getElementById("editTask").style.display = "none";
        var JSONpackage = {
            id: selectedMeeting.id,
            subject: document.getElementById("editSubject").value,
            date: document.getElementById("editDate").value,
            time: document.getElementById("editTime").value,
            text: document.getElementById("editTitle").value,
            attendees: "Guest",
            len: document.getElementById("editLength").value
        }
        var moveable = {
            type: "editTask",
            id: selectedMeeting.id,
            data: JSONpackage
        }
        server.send(JSON.stringify(moveable));
    }

    function removeServerTask(e) {
        document.getElementById("editTask").style.display = "none";
        document.getElementById(selectedMeeting.id + "").className = "removed";
        console.log(document.getElementById(selectedMeeting.id + "").classList);
        var moveable = {
            type: "removeTask",
            date: selectedMeeting.date,
            id: selectedMeeting.id
        }
        server.send(JSON.stringify(moveable));
    }

    return (
        <div style={container} id="editTask" onClick={function (e) {
            if (e.target.id == "editTask")
                document.getElementById("editTask").style.display = "none";
        }}>
            <div style={style} id="form">
                <div style={{ display: "flex", textAlign: "center", margin: "auto" }}>
                    <h5>Schedule a meeting!</h5>
                </div>
                <br />
                <Form >
                    <Form.Row>
                        <Form.Group>
                            <Form.Label>Subject</Form.Label>
                            <Form.Control type="text" id="editSubject" placeholder="Class" />
                        </Form.Group>
                        <Form.Group style={{ marginLeft: "2%" }}>
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="textarea" id="editTitle" placeholder="Brief Overview" />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row>
                        <Form.Group>
                            <Form.Label>Date</Form.Label>
                            <Form.Control type="date" id="editDate" />
                        </Form.Group>
                        <Form.Group style={{ marginLeft: "2%" }}>
                            <Form.Label>Time</Form.Label>
                            <Form.Control type="time" id="editTime" />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row>
                        <Form.Group>
                            <Form.Label>Length</Form.Label>
                            <Form.Control as="select" id="editLength">
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
                            <Button onClick={editServerTask} variant="warning" >Update changes</Button>
                        </Form.Group>
                        <Form.Group style={{ marginLeft: "2%" }}>
                            <Form.Label style={{ color: "transparent" }}> uwu </Form.Label>
                            <br />
                            <Button onClick={removeServerTask} variant="danger" >Remove meeting</Button>
                        </Form.Group>
                    </Form.Row>
                </Form>
            </div>
        </div>
    )
}


function Task(props) {

    //console.log(props.meeting)
    //console.log(timeHeight * (props.meeting.len / 60) + "px")

    var sub;

    if (subjectStyles[props.meeting.subject]) {
        sub = subjectStyles[props.meeting.subject];
    } else {
        sub = subjectStyles.default;
    }

    var topHeight = (parseInt(props.meeting.time.substr(3)) / 60) * timeHeight;
    //console.log(topHeight);

    var style = {
        "backgroundColor": sub.background,
        "display": "block",
        "height": timeHeight * (props.meeting.len / 60) - 3 + "px",
        "marginTop": topHeight + "px",
        "borderRadius": "10px",
        "border": "2px " + sub.border + " solid",
        "overflow": "auto"
    }

    function clicks(e) {
        e.preventDefault();
        document.getElementById("editTask").style.display = "block";
        document.getElementById("editSubject").value = props.meeting.subject;
        document.getElementById("editTitle").value = props.meeting.text;
        document.getElementById("editDate").value = props.meeting.date;
        document.getElementById("editTime").value = props.meeting.time;
        document.getElementById("editLength").value = props.meeting.len;

        selectedMeeting = props.meeting;


        /*
        document.getElementById("createDate").value = "2021-03-" + props.meeting.date;
        document.getElementById("createTime").value = props.meeting.hour + ":00";*/
    }

    return (
        <div style={style} className="task" onClick={clicks} id={props.meeting.id + ""}>
            <p>{props.meeting.text}</p>
            <p>Attendees: {props.meeting.attendees} </p>
        </div>
    )
}

function Hour(props) {

    var text = "";
    var id = "";

    for (var i = 0; i < weeklyMeetings.length; i++) {

        if (props.date == parseInt(weeklyMeetings[i].date.split("-")[2]) && props.hour == weeklyMeetings[i].time.substr(0, 2)) {

            text = <Task meeting={weeklyMeetings[i]} />
        }
    }

    function selectHour(e) {
        if (e.target.className != "hour") {
            return;
        }
        if (click <= 100 && !moving) {
            document.getElementById("createTask").style.display = "block";
            document.getElementById("createDate").value = "2021-03-" + props.date;
            document.getElementById("createTime").value = props.hour + ":00";
        }
    }

    return (
        <div className="hour" id={id} onClick={selectHour}>
            <div className="half"></div>
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
        <div className="week" id="week">
            <div className="overlayTop" />
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

var mediaSettings = [true, true];

function Meeting(props) {

    const style = {
        position: "absolute",
        display: "none",
        zIndex: 10000,
        width: "80%",
        height: "80%",
        margin: "0 10% 0 10%",
        filter: "blur(10)"
    }

    return <div style={style} className="hidden" id="video">
        <div id="meetingVideos" className="meetingVideos back" />
        <CallButtons />
    </div>;
}

var inMeeting = false;
var muted = false;
var cameraOff = false;

function CallButtons(props) {

    const style = {
        position: "relative",
        display: "flex",
        margin: "auto",
        width: "30%",
        height: "10%",
        bottom: "10%",
        zIndex: 20000000000000000000000000
    }

    function joinCall(e) {

        if (!conn) {
            return;
        } else if (inMeeting) {
            leaveCall(e);
            return;
        }

        console.log("join");

        inMeeting = true;

        createVid("localhost", conn.media);

        conn.sendToAll("joinCall", mediaSettings);

        Object.keys(videos).forEach(element => {
            if (element != "localhost") {
                videos[element].muted = false;
            }
        });

        var button = document.getElementById("joinleave");
        button.className = "circleButton leave";
        document.getElementById("joinimg").src = end;
    }

    function leaveCall(e) {
        inMeeting = false;
        console.log("leave");
        Object.keys(videos).forEach(element => {
            if (element != "localhost") {
                videos[element].muted = true;
            }
        });

        removeVid("localhost");
        conn.sendToAll("leaveCall", "disconnect");

        document.getElementById("joinleave").className = "circleButton join";
        document.getElementById("joinimg").src = call;
    }

    function toggleMute(e) {
        if (muted) {
            muted = false;
            document.getElementById("mute").className = "circleButton enabled";
            conn.media.getAudioTracks()[0].enabled = true;
        } else {
            muted = true;
            document.getElementById("mute").className = "circleButton disabled";
            conn.media.getAudioTracks()[0].enabled = false;
        }
    }

    function toggleCam(e) {
        if (cameraOff) {
            cameraOff = false;
            document.getElementById("cam").className = "circleButton enabled";
            conn.media.getTracks()[1].enabled = true;
            videos["localhost"].style.opacity = 1;
            conn.sendToAll("enabledVideo", mediaSettings);
        } else {
            cameraOff = true;
            document.getElementById("cam").className = "circleButton disabled";
            conn.media.getTracks()[1].enabled = false;
            videos["localhost"].style.opacity = 0;
            conn.sendToAll("disabledVideo", mediaSettings);
        }
    }

    return <div style={style}>
        <div className="circleButton join" onClick={joinCall} id="joinleave"> <img id="joinimg" src={call} /> </div>
        <div className="circleButton enabled" id="cam" onClick={toggleCam}> <img src={camera} /> </div>
        <div className="circleButton enabled" id="mute" onClick={toggleMute}> <img src={mic} /> </div>
    </div>
}

var name = "";
function Login(props) {

    var ui = {
        position: 'absolute',
        top: '4%',
        right: "4%",
        border: "2px solid transparent",
        'borderRadius': "25px",
        'zIndex': 5
    }

    return (<div style={ui}>
        <div id="init">
            <InputGroup className="mb-3">
                <FormControl id="name"
                    placeholder="Username"
                    onChange={(e) => {
                        name = e.target.value;
                    }}
                    aria-label="Username"
                    aria-describedby="basic-addon2"
                />
                <InputGroup.Append>
                    <Button onClick={attemptConnection} id="conn" variant="outline-secondary">Connect!</Button>
                </InputGroup.Append>
            </InputGroup>
        </div>
    </div>);
}

function UI(props) {

    const [meeting, setMeeting] = useState(false);

    var container = {
        "width": "95vw",
        "minWidth": "1000px",
        "height": "100vh",
        "paddingTop": "5vh",
        "margin": "auto",
        "overflow": "hidden",
        "position": "relative"
    }

    var style = {
        display: "flex",
        margin: "auto",
        textAlign: "center",
        width: "min-content"
    }

    function switchT(e) {
        if (meeting) {
            document.getElementById("schedtitle").className = "title selected";
            document.getElementById("meettitle").className = "title";
            document.getElementById("week").className = "slideInLeft week";
            document.getElementById("video").className = "slideOutLeft hidden";
            setMeeting(false);
        }
    }

    function switchT2(e) {
        if (!meeting) {
            document.getElementById("schedtitle").className = "title";
            document.getElementById("meettitle").className = "title selected";
            document.getElementById("video").style.opacity = 1;
            document.getElementById("week").className = "slideOutRight week";
            document.getElementById("video").className = "slideInRight";
            document.getElementById("video").style.display = "block";
            setMeeting(true);
        }
    }


    return (<div style={container}>
        <div style={style}>
            <h1 onClick={switchT} id="schedtitle" className="title selected">Schedule</h1>
            <h1 onClick={switchT2} id="meettitle" className="title">Meeting</h1>
        </div>
        <CreateTask />
        <EditTask />
        <Meeting />
        <Login />
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

    var hourDist = (hour - 8) * timeHeight;
    var minDist = (minute / 60) * timeHeight;
    var secDist = (timeHeight / 60) * (second / 60);

    var totalDist = (hourDist + minDist + secDist);
    if (hour >= 21) {
        totalDist = 14 * timeHeight;
    } else if (hour < 8) {
        totalDist = 0;
    }

    document.getElementById("currentTime").style.top = totalDist + "px";

}, 100);

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

}, 1000);


function attemptConnection(e) {
    connect(name);
}

var conn;

function connect(_name) {
    console.log("Connecting");
    conn = new webrtc(_name);
    document.getElementById("name").disabled = true;
    document.getElementById("conn").disabled = true;

    conn.onConnect = function () {
        console.log("Connected!");
        //logEvent("Connected to Server!");
        document.getElementById("init").style.display = 'none';
    }

    conn.onJoinCall = function (data) {
        //console.log(data);
        createVid(data.user, conn.tracks[data.user]);
        //console.log(conn.media);
        //addText(data.user, data.message);
    }

    conn.onDisabledVideo = function (user) {
        console.log("disabled!");
        //document.getElementById(user).style.opacity = 0;
        videos[user].style.opacity = "0";
    }

    conn.onEnabledVideo = function (user) {
        videos[user].style.opacity = "1";
    }

    conn.onLeaveCall = function (user) {
        removeVid(user);
    }

    conn.onConn = function (data) {
        //console.log(document.getElementById("canvas"));
        //document.getElementById("canvas").innerHTML += players[data];
    }

    conn.onNewChannel = function (data) {
        console.log(data);
        if (inMeeting) {
            console.log("sending to new user!");
            conn.sendToUser("joinCall", data, mediaSettings);
        }
    }
    conn.log = function (data) {
        //logEvent(data);
    }

    conn.onDis = function (data) {
        //update = true;
    }

    conn.onNewTrack = function (name, data) {
        console.log(data);

        //createVid(name, data);
    }
}


var videos = {};
function createVid(name, data) {
    document.getElementById("meetingVideos").className = "meetingVideos";
    if (document.getElementById(name)) {
        return;
    }
    var container = document.createElement('div');
    container.id = name;
    container.className = "videoBox";

    var track = document.createElement('video');
    track.srcObject = data;
    track.autoplay = true;
    if (!inMeeting || name == "localhost") {
        track.muted = true;
    }
    videos[name] = track;
    container.appendChild(track)
    document.getElementById("meetingVideos").appendChild(container);
}

function removeVid(name) {
    if (!videos[name]) {
        return
    }
    videos[name].remove();
    document.getElementById(name).remove();
    delete videos[name];

    if (Object.keys(videos).length == 0) {
        document.getElementById("meetingVideos").className = "meetingVideos back";
    }
}

/*
function createVid(name, data) {

    var track = document.createElement('video');
    track.id = name;
    track.srcObject = data;
    track.autoplay = true;
    track.muted = true;
    track.className = "blur";
    document.getElementById("meetingVideos").appendChild(track);
}*/