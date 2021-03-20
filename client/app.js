import React, { useEffect, useRef } from 'react'
import { render } from 'react-dom'
import Table from 'react-bootstrap/Table'

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


// Storage for tutorials 

let weeklyMeetings = [
    {
        subject: "CS",
        date: "3/19/2021",
        time: "12",
        text: "indexing and iteration practice",
        author: "Bryant",
        len: 60
    }
]

server.onopen = () => {
    console.log(date)
}

function createTask(props) {

    var container = {
        "position": "absolute",
        "width": "100vw",
        "height": "100vh",
        "top": "0",
        "left": "0",
    }

    var style = {
        "position": "absolute",
        "maxWidth": "300px",
        "width": "30vw",
        "maxHeight": "500px",
        "height": "40vh",
    }
    return (
        <div style={container}>
            <div style={style}>

            </div>
        </div>
    )
}

function Task(props) {

    console.log(props.meeting)
    console.log(timeHeight * (props.meeting.len / 60) + "px")

    useEffect(() => {

    },[timeHeight])

    var style = {
        "backgroundColor": "blue",
        "display": "block",
        "height": timeHeight * (props.meeting.len / 60) + "px",
        "width": "100%",
    }

    return (
        <div style={style}>
            HIAFJK
        </div>
    )
}

function Hour(props) {

    var text = "";
    var id = "";

    for (var i = 0; i < weeklyMeetings.length; i++) {
        if (props.date == weeklyMeetings[i].date.split("/")[1] && props.hour == weeklyMeetings[i].time) {
            console.log("HJASFDHJXCL");
            text = <Task meeting={weeklyMeetings[i]} />
        }
    }

    return (
        <div className="hour" id={id}>
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

                            if (props.date == date && parseInt(hour) == time) {
                                console.log(time);
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
        <div>

        </div>
        <Week date={date} />
    </div>)
}

var mouse = null;
var prev = [0, 0];
function swipe(e) {
    mouse = [e.clientX, e.clientY];
    prev[0] = document.getElementById("schedule").scrollLeft;
    prev[1] = document.getElementById("schedule").scrollTop;
    console.log(e);
}

render(
    <>
        <UI />
    </>,
    document.getElementById("root")
);

document.onmouseup = function () {
    mouse = null; 
}

document.onmousemove = function (e) {
    if (mouse != null) {
        console.log((e.clientX - mouse[0]) + " " + (e.clientY - mouse[1]))
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

    var hourDist = (hour-8) * timeHeight;
    var minDist = (minute / 60) * timeHeight;
    var secDist = (timeHeight / 60) * (second / 60);

    var totalDist = (hourDist + minDist + secDist);

    console.log(hourDist/timeHeight + "%");

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
    console.log(document.getElementById("currentTime").classList);

}, 1000);