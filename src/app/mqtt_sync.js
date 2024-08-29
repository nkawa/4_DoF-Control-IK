"use client";
import mqtt from 'mqtt';

//import { v4 as uuidv4 } from 'uuid';  // for unique ID 

const uniqueId = "unique";//uuidv4(); // constant ID for client.
const MQTT_SERVER_URL = "wss://sora2.uclab.jp/mqws"
export var mqttclient = null;

export const connectMQTT = (connectCallback) => {
    if (mqttclient == null) {
        const client = new mqtt.connect(MQTT_SERVER_URL, {
            protocolVersion: 4,  // MQTT v3.1.1
            keepalive: 120,
            reconnectPeriod: 2000,
        });
        client.on("connect", () => {
            console.log("MQTT Connected", this);
            const msg = JSON.stringify({ myID: uniqueId, type: "KINOVA" });
            client.publish("clients", msg);
            console.log("Sending My clientID", msg);
            mqttclient = client

            if (connectCallback != undefined) {
                connectCallback()
            }
        });
        client.on("reconnect", () => {
            console.log("MQTT Reconnected");
            mqttclient = client;
        });
        client.on("close", () => {
            console.log("MQTT Closed");
            mqttclient = null;
        });
        client.on("offline", () => {
            console.log("MQTT Offline");
        });
        client.on("error", () => {
            console.log("MQTT Error");
        });
        client.on("disconnect", () => { // only for MQTT 5.0
            console.log("MQTT disconnect");
        });
    }
    return mqttclient
}

export const subscribe = (topic, callback) => {
    console.log("SubScribe topic!", topic, callback)
    if (mqttclient != null) {
        mqttclient.subscribe(topic, { qos: 0 }, function (error, granted) {
            if (error) {
                console.log("subscribe error on", topic)
            } else {
                console.log(`Granted ${granted}`)
                //    console.log(`Granted ${granted[0].topic}`)
                mqttclient.on("message", (tpc, payload, packet) => {
                    if (topic == tpc) {
                        callback(JSON.parse(payload.toString()))
                    }
                });
            }
        });
    } else {
        console.log("MQTT not connected but try to subscribe")
    }
}