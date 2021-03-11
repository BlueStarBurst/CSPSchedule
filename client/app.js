import React, { useEffect } from 'react'
import { render } from 'react-dom'

import "./style.css"

//var server = new WebSocket("wss://blueserver.us.to:26950/");
var server = new WebSocket("wss://47.184.193.193:26950/");

let [month, date, year] = new Date().toLocaleDateString("en-US").split("/");
let day = new Date().getDay();
let [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /);

let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
        "backgroundColor": "rgba(0, 0, 0, 0.34)"
    }
    return (
        <div style={container}>
            <div style={style}>

            </div>
        </div>
    )
}

function Task(props) {

}

function Hour(props) {
    var style = {
        "width": "max-available",
        "height": "max-available",
        "borderBottom": "1px solid",
        "minHeight": "100px",
        "textAlign": "left",
    }

    var time = (props.hour / 12 > 1 ? (props.hour % 12 + "PM") : (props.hour + "AM"))

    return (
        <div style={style}>
            {time}
        </div>
    )
}

function Day(props) {

    var head = {
        "width": "100%",
        "minWidth": "200px",
        "borderBottom": "solid 2px",
        "position": "fixed"
    }

    var style = {
        "width": "100%",
        "minWidth": "200px",
        "height": "max-content",
        "borderTop": "solid 2px",
        "borderLeft": "solid 2px",
        "borderBottom": "solid 2px",
        "textAlign": "center",
        "display": "block"
    }

    console.log();

    if (props.end) {
        style["borderRight"] = "solid 2px";
    }

    var hours = [];
    for (var i = 8; i < 22; i++) {
        hours.push(<Hour hour={i} key={i} />);
    }

    return (
        <>

            <div style={style}>
                <div style={head}>
                    {days[props.day].substr(0,1) + " "}
                </div>
                {props.date}
                {hours}
            </div>
        </>
    )
}

function Week(props) {

    var week = [];

    for (var i = props.date - day; i < props.date - day + 7; i++) {
        week.push(<Day date={i} highlighted={props.date == i} end={i == props.date - day + 6} day={i - props.date + day} key={i} />);
    }

    var style = {
        "overflow": "hidden",
        "margin": "auto",
        "width": "100%",
        "height": "100%",
        "display": "flex",
        "padding": "0",
    }

    return (
        <div style={style} onMouseDown={swipe} id="schedule">
            {week}
        </div>
    );
}

function UI(props) {

    var container = {
        "width": "90vw",
        "overflow": "hidden",
        "height": "80vh",
        "paddingTop": "5vh",
        "margin": "auto"
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

document.onmouseup = function () { mouse = null; }

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
