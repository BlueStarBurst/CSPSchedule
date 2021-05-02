export default class webrtc {

    //Structure and WebRTC Candidate code based on: https://blog.logrocket.com/get-a-basic-chat-application-working-with-webrtc/

    constructor(_name) {

        // using googles stun server cuz they didn't say no
        this.STUN = {
            urls: 'stun:stun.l.google.com:19302'
        };

        // used to ask for media
        this.mediaConstraints = {
            audio: true, 
            video: true 
        };

        this.config = {
            iceServers: [this.STUN]
        };

        this.user = _name;

        this.peers = {};
        this.channels = {};
        this.tracks = {};
        this.serverConnection;



        this.server();
    }

    // connect to server and assign message types
    async server() {
        this.serverConnection = await this.connect();
        this.serverConnection.onmessage = message => {
            const data = JSON.parse(message.data);
            switch (data.type) {
                case "connect":
                    break;
                case "login":
                    this.onConnect();
                    this.users(data);
                    break
                case "updateUsers":
                    this.updateUsers(data);
                    break;
                case "offer":
                    this.onOffer(data);
                    break;
                case "answer":
                    this.onAnswer(data);
                    break;
                case "candidate":
                    this.onCandidate(data);
                    break;
                case "error":
                    this.onError(data);
                    break;
                case "leave":
                    //this.onLeave(data);
                    this.attemptDis(data.user.userName);
                    break;
                default:
                    break;
            }
        };
        this.send({
            type: "login",
            name: this.user
        })
    }

    // when user leaves
    async onLeave(data) {
        delete this.peers[data];
        delete this.channels[data];
    }

    // connects to wss
    async connect() {
        this.media = await navigator.mediaDevices.getUserMedia(
            {
                video: {
                    width: { ideal: 1080 },
                    height: { ideal: 720 }
                }, audio: true
            }).catch((er) => {
                console.log("nope!");
            });
        return new Promise(function (resolve, reject) {
            var server = new WebSocket("wss://blueserver.us.to:26950/");
            server.onopen = function () {
                resolve(server);
            };
            server.onerror = function (err) {
                reject(err);
            };
        });
    }

    // create offers and send them to all webrtc users
    async offerToAll() {
        Object.keys(this.peers).forEach(async element => {
            const offer = await this.peers[element].createOffer();
            await this.peers[element].setLocalDescription(offer);
            this.send({ type: "offer", offer: offer, name: element });
        });
    }

    // when recieves answer via ws
    async onAnswer({ answer, sender }) {
        if (this.peers[sender].connectionState == "stable")
            return;

        console.log(`Got an answer from ${sender}`);
        this.log("Got an answer from " + sender);
        this.peers[sender].setRemoteDescription(new RTCSessionDescription(answer));

        console.log(this.channels);
        console.log(this.peers);
    }

    // when recieves offer via ws
    async onOffer({ offer, name }) {
        if (this.peers[name].connectionState == "stable")
            return;

        console.log(`Got an offer from ${name}`);
        this.log(`Got an offer from ${name}`);

        this.peers[name].setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peers[name].createAnswer();
        await this.peers[name].setLocalDescription(answer);
        this.send({ type: "answer", answer: this.peers[name].localDescription, name, sender: this.user })

        console.log(this.peers);
    }

    // when recieves candidate via ws
    async onCandidate(data) {
        //console.log(data);
        this.peers[data.sender].addIceCandidate(data.candidate);
    }

    // init webrtc create offer to all
    users(data) {
        if (!data.success) {
            return;
        }
        data.users.forEach(element => {
            if (!this.peers[element.userName]) {
                this.createPeer(element.userName);
            }
        });
        this.offerToAll();
    }

    // update the users in the peer list
    updateUsers(data) {
        if (!this.peers[data.user.userName]) {
            this.createPeer(data.user.userName);
        }
    }

    // creates a rtc peer connection
    async createPeer(_name) {
        var peerConnection = new RTCPeerConnection(this.config);

        peerConnection.onicecandidate = ({ candidate }) => {
            if (candidate) {
                this.send({
                    name: _name,
                    sender: this.user,
                    type: "candidate",
                    candidate
                });
            }
        };

        this.channels[_name] = peerConnection.createDataChannel("data");

        for (const track of this.media.getTracks()) {
            peerConnection.addTrack(track, this.media);
        }


        let inboundStream = null;

        peerConnection.ontrack = ev => {
            console.log("Tracks have been recieved!");
            if (ev.streams && ev.streams[0]) {
                this.tracks[_name] = ev.streams[0];

            } else {
                if (!inboundStream) {
                    inboundStream = new MediaStream();
                    //videoElem.srcObject = inboundStream;
                    //this.onNewTrack(inboundStream);
                }
                inboundStream.addTrack(ev.track);
                this.tracks[_name] = inboundStream;
            }

            //console.log(this.tracks[_name]);
        }



        const self = this;

        peerConnection.ondatachannel = function (ev) {
            console.log('Data channel is created!');
            self.log("Created data channel for user: " + _name);
            ev.channel.onopen = function () {
                console.log('Data channel is open and ready to be used.');
                self.onNewChannel(_name);
            };
            ev.channel.onmessage = function (event) {
                var data = JSON.parse(event.data);
                console.log(data);
                //console.log(data);
                switch (data.type) {
                    case "joinCall":
                        //console.log("onjoincall");
                        self.onJoinCall(data);
                        break;
                    case "leaveCall":
                        self.onLeaveCall(data.user);
                        break;
                    case "disabledVideo":
                        self.onDisabledVideo(data.user);
                        break;
                    case "enabledVideo":
                        self.onEnabledVideo(data.user);
                        break;
                    default:
                        break;
                }
            }
        };

        peerConnection.onconnectionstatechange = function (event) {
            switch (peerConnection.connectionState) {
                case "connected":
                    console.log(`The connection with ${_name} was successful!`);
                    //self.onNewTrack(_name, self.tracks[_name]);
                    //self.log(`The connection with ${_name} was successful!`);
                    //self.onConn(_name);
                    break;
                case "connecting":
                    //setTimeout(self.reconnect(_name), 10000 );
                    break;
                case "disconnected":
                case "failed":
                    self.onLeaveCall(_name);
                    console.log(`The connection with ${_name} failed or disconnected`);
                    peerConnection.restartIce();
                    //self.reOffer(_name);
                    break;
                case "closed":
                    console.log(`The connection with ${_name} was closed`);
                    break;
            }
        }

        this.peers[_name] = peerConnection;
        return true;
    }

    // tries to reconnect to webrtc clients
    reconnect(_name) {
        console.log("reconnecting...");
        if (this.peers[_name].connectionState == "connecting") {
            this.peers[_name].restartIce();
        }
    }

    // just in case offer and answer doesn't work first time
    async reOffer(_name) {
        if (this.peers[_name].localDescription.type == "offer") {
            return;
        }
        await this.createPeer(_name);
        const offer = await this.peers[_name].createOffer();
        await this.peers[_name].setLocalDescription(offer);
        this.send({ type: "offer", offer: offer, name: _name });
    }

    attemptDis(_name) {
        this.onDis(_name);
        this.onLeave(_name);
    }

    send(data) {
        this.serverConnection.send(JSON.stringify(data));
    }

    onError({ message }) {
        console.log(message);
    }

    sendToAll(type, message) {
        Object.keys(this.channels).forEach((key) => {
            if (this.channels[key].readyState == 'open') {
                this.channels[key].send(JSON.stringify({ type: type, user: this.user, message: message }));
            }
        })
    }

    sendToUser(type, reciever, message) {
        console.log("sending to user " + reciever);
        Object.keys(this.channels).forEach((key) => {
            console.log(key);
        });


        if (this.channels[reciever].readyState == 'open') {
            this.channels[reciever].send(JSON.stringify({ type: type, user: this.user, message: message }));
        }
    }

    // redefinable functions!

    onConnect() { };
    onConn() { };
    onMessage() { };
    log() { };
    onDis() { };
    onNewTrack() { };
}