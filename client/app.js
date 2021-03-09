import React from 'react'
import { render } from 'react-dom'

var server = new WebSocket("wss://blueserver.us.to:26950/");

server.onopen = () => {
    console.log("hi!");
}





render(
    <>
    <h1> Schedule </h1>
    </>,
    document.getElementById("root")
);