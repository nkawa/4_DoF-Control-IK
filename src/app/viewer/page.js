"use client";
import * as React from 'react'
//import Controller from '../controller.js'
import { mqttclient, connectMQTT, subscribe } from '../mqtt_sync.js'

export default function Home() {
    const [rendered, set_rendered] = React.useState(false)

    const robotNameList = ["4_DoF"]
    const [robotName, set_robotName] = React.useState(robotNameList[0])
    const [j1_rotate, set_j1_rotate] = React.useState(0)
    const [j2_rotate, set_j2_rotate] = React.useState(0)
    const [j3_rotate, set_j3_rotate] = React.useState(0)
    const [j4_rotate, set_j4_rotate] = React.useState(0)
    const [j5_rotate, set_j5_rotate] = React.useState(0)
    const [c_pos_x, set_c_pos_x] = React.useState(0)
    const [c_pos_y, set_c_pos_y] = React.useState(0) // 0.25
    const [c_pos_z, set_c_pos_z] = React.useState(0) // 0.4
    const [c_deg_x, set_c_deg_x] = React.useState(0)
    const [c_deg_y, set_c_deg_y] = React.useState(0)
    const [c_deg_z, set_c_deg_z] = React.useState(0)
    const [source, set_source] = React.useState({ x: 0, y: 0, z: 0 })
    const [target, set_target] = React.useState({ x: 0, y: 0.5, z: 0 })
    const [joint_length, set_joint_length] = React.useState([])
    const [nodes, set_nodes] = React.useState([])
    const [wrist_deg, set_wrist_deg] = React.useState(90)
    const [box_scale, set_box_scale] = React.useState("0.02 0.02 0.02")
    const [box_visible, set_box_visible] = React.useState(false)
    let registered = false

    const joint_pos = { //各パーツの相対位置
        j0: { x: 0, y: 0, z: -0.4 }, j1: { x: 0, y: 0.046, z: 0 },
        j2: { x: 0, y: 0.0538, z: 0 }, j3: { x: 0, y: 0.14015, z: 0 }, j4: { x: 0, y: 0.16325, z: 0 },
        j5_l: { x: 0.0128, y: 0.05075, z: -0.005 }, j5_r: { x: -0.0128, y: 0.05075, z: -0.005 },
        j6: { x: 0, y: 0.04605, z: 0 }
    }

    const distance = (s_pos, t_pos) => {
        return Math.sqrt((t_pos.x - s_pos.x) ** 2 + (t_pos.y - s_pos.y) ** 2 + (t_pos.z - s_pos.z) ** 2);
    }

    const pos_add = (pos1, pos2) => {
        return { x: (pos1.x + pos2.x), y: (pos1.y + pos2.y), z: (pos1.z + pos2.z) }
    }

    const pos_sub = (pos1, pos2) => {
        return { x: (pos1.x - pos2.x), y: (pos1.y - pos2.y), z: (pos1.z - pos2.z) }
    }


    //関節位置と関節間の距離の初期設定
    React.useEffect(() => {
        //関節位置（４か所）の初期位置設定
        // 0:j1とj2の間の関節位置
        // 1:j2とj3の間の関節位置
        // 2:j3とj4の間の関節位置
        // 3:掴む部分の位置
        const setNode = []
        setNode.push(pos_add(pos_add(joint_pos.j0, joint_pos.j1), joint_pos.j2))  //0
        setNode.push(pos_add(setNode[0], joint_pos.j3)) //1
        setNode.push(pos_add(setNode[1], joint_pos.j4)) //2
        setNode.push(pos_add(pos_add(setNode[2], { x: 0, y: joint_pos.j5_l.y, z: 0 }), joint_pos.j6))  //3
        set_nodes(setNode)

        set_source(setNode[0])  //計算の基点はj1とj2の間の関節位置

        //関節間の距離設定
        // 0：上記の間接の０⇒１の間の距離
        // 1：上記の間接の１⇒２の間の距離
        // 2：上記の間接の２⇒３の間の距離
        set_joint_length([
            distance(setNode[0], setNode[1]),  //0
            distance(setNode[1], setNode[2]),  //1
            distance(setNode[2], setNode[3]),  //2
            0,
        ])
    }, [])

    const setLSSJoints = (payload) => {
        console.log("Payload", payload)
        const rorate = payload.rotate
        set_j1_rotate(rorate[0])
        set_j2_rotate(rorate[1])
        set_j3_rotate(rorate[2])
        set_j4_rotate(rorate[3])
        set_j5_rotate(rorate[4])
    }


    const robotChange = () => {
        const get = (robotName) => {
            let changeIdx = robotNameList.findIndex((e) => e === robotName) + 1
            if (changeIdx >= robotNameList.length) {
                changeIdx = 0
            }
            return robotNameList[changeIdx]
        }
        set_robotName(get)
    }

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            require("aframe");
            setTimeout(set_rendered(true), 1000)
            console.log('set_rendered')

            if (!registered) {
                registered = true
                AFRAME.registerComponent('robot-click', {
                    init: function () {
                        this.el.addEventListener('click', (evt) => {
                            robotChange()
                            console.log('robot-click')
                        });
                    }
                });

                // mqtt
                console.log("Connecting MQTT");
                connectMQTT("LSSViewer", () => subscribe("lss4dof/state", setLSSJoints));
            }
        }
    }, [typeof window])


    const edit_pos = (posxyz) => `${posxyz.x} ${posxyz.y} ${posxyz.z}`

    const robotProps = {
        robotNameList, robotName, joint_pos, edit_pos, j1_rotate, j2_rotate, j3_rotate, j4_rotate, j5_rotate
    }

    const aboxprops = {
        nodes, box_scale, box_visible, edit_pos
    }

    if (rendered) {
        return (
            <>
                <a-scene>
                    <Abox {...aboxprops} />

                    <a-plane position="0 0 0" rotation="-90 0 0" width="10" height="10" color="#7BC8A4" shadow></a-plane>


                    <Assets />

                    <Select_Robot {...robotProps} />
                    <a-entity light="type: directional; color: #FFF; intensity: 0.8" position="1 2 1"></a-entity>
                    <a-entity light="type: directional; color: #FFF; intensity: 0.8" position="-1 1 2"></a-entity>
                    <a-entity id="rig" position={`${c_pos_x} ${c_pos_y} ${c_pos_z}`} rotation={`${c_deg_x} ${c_deg_y} ${c_deg_z}`}>
                        <a-entity id="camera" camera cursor="rayOrigin: mouse;" look-controls wasd-controls position="0 0.2 0.15">
                        </a-entity>
                    </a-entity>

                    <a-sphere position={edit_pos(target)} scale="0.012 0.012 0.012" color="yellow" visible={true}></a-sphere>
                </a-scene>
            </>
        );
    } else {
        return (
            <a-scene>
                <Assets />
            </a-scene>
        )
    }
}

const Abox = (props) => {
    const { nodes, box_scale, box_visible, edit_pos } = props
    const coltbl = ["red", "green", "blue", "yellow"]
    if (nodes.length > 0) {
        return nodes.map((node, idx) => <a-box key={idx} position={edit_pos(node)} scale={box_scale} color={coltbl[idx]} visible={box_visible}></a-box>)
    } else {
        return null
    }
}

const Assets = () => {
    return (
        <a-assets>
            {/*4_DoF*/}
            <a-asset-items id="j0" src="link_0.gltf" ></a-asset-items>
            <a-asset-items id="j1" src="link_1.gltf" ></a-asset-items>
            <a-asset-items id="j2" src="link_2.gltf" ></a-asset-items>
            <a-asset-items id="j3" src="link_3.gltf" ></a-asset-items>
            <a-asset-items id="j4" src="link_4.gltf" ></a-asset-items>
            <a-asset-items id="j5_l" src="finger_l.gltf" ></a-asset-items>
            <a-asset-items id="j5_r" src="finger_r.gltf" ></a-asset-items>
        </a-assets>
    )
}

const Four4_DoF = (props) => {
    const { visible, joint_pos, edit_pos, j1_rotate, j2_rotate, j3_rotate, j4_rotate, j5_rotate } = props
    return (<>{visible ?
        <a-entity gltf-model="#j0" position={edit_pos(joint_pos.j0)} rotation={`0 0 0`}>
            <a-entity gltf-model="#j1" position={edit_pos(joint_pos.j1)} rotation={`0 ${j1_rotate} 0`}>
                <a-entity gltf-model="#j2" position={edit_pos(joint_pos.j2)} rotation={`${j2_rotate} 0 0`}>
                    <a-entity gltf-model="#j3" position={edit_pos(joint_pos.j3)} rotation={`${j3_rotate} 0 0`}>
                        <a-entity gltf-model="#j4" position={edit_pos(joint_pos.j4)} rotation={`${j4_rotate} 0 0`}>
                            <a-entity gltf-model="#j5_l" position={edit_pos(joint_pos.j5_l)} rotation={`0 0 ${-j5_rotate}`}></a-entity>
                            <a-entity gltf-model="#j5_r" position={edit_pos(joint_pos.j5_r)} rotation={`0 0 ${j5_rotate}`}></a-entity>
                        </a-entity>
                    </a-entity>
                </a-entity>
            </a-entity>
        </a-entity> : null}</>
    )
}

const Select_Robot = (props) => {
    const { robotNameList, robotName, ...rotateProps } = props
    const visibletable = robotNameList.map(() => false)
    const findindex = robotNameList.findIndex((e) => e === robotName)
    if (findindex >= 0) {
        visibletable[findindex] = true
    }
    return (<>
        <Four4_DoF visible={visibletable[0]} {...rotateProps} />
    </>)
}









