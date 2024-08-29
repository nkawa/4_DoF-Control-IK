"use client";
import * as React from 'react'
import Controller from './controller.js'
import { mqttclient, connectMQTT, subscribe } from './mqtt_sync.js'
import { VR_INFO_Camera, VR_Controller_Right, VR_mode_detector, add_vr_component } from './vr_controller.js';

export default function Home() {
  const [rendered, set_rendered] = React.useState(false)
  const [trigger, set_trigger] = React.useState(false)
  const [grip, set_grip] = React.useState(false)
  const [grip_state, set_grp_state] = React.useState(0)
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

  const joint_pos = {
    j0: { x: 0, y: 1.2, z: -0.4 }, j1: { x: 0, y: 0.046, z: 0 },
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

  // ノードの初期化
  React.useEffect(() => {
    const setNode = []
    setNode.push(pos_add(pos_add(joint_pos.j0, joint_pos.j1), joint_pos.j2))  //0
    setNode.push(pos_add(setNode[0], joint_pos.j3)) //1
    setNode.push(pos_add(setNode[1], joint_pos.j4)) //2
    setNode.push(pos_add(pos_add(setNode[2], { x: 0, y: joint_pos.j5_l.y, z: 0 }), joint_pos.j6))  //3
    set_nodes(setNode)

    set_source(setNode[0])

    set_joint_length([
      distance(setNode[0], setNode[1]),  //0
      distance(setNode[1], setNode[2]),  //1
      distance(setNode[2], setNode[3]),  //2
      0,
    ])
  }, [])

  const open_gripper = () => {
    if (grip && j5_rotate < 60) {
      set_j5_rotate((grp) => grp + 3);
      set_grip((cur) => {
        if (cur) {// grip が真の間 openする
          setTimeout(open_gripper, 100);
        }
        cur;
      });
    }
  }
  const close_gripper = () => {
    if (trigger && j5_rotate > 0) {
      set_j5_rotate((grp) => grp - 3);
      set_trigger((cur) => {
        if (cur) {// trigger が真の間 close;
          setTimeout(close_gripper, 100);
        }
        cur;
      });
    }
  }

  //トリガ―押してる間はつかむ
  React.useEffect(() => {
    if (trigger) {
      close_gripper();
    }
  }, [trigger])

  //Gripで離す　60がmax
  React.useEffect(() => {
    if (grip) {
      open_gripper();
    }
  }, [grip])

  React.useEffect(() => {
    if (mqttclient != null) {
      const msg = JSON.stringify(
        {
          grip,
          toggle,
          pos: target,
          ori: { x: 0, y: 0, z: 0 },
          rotate: [j1_rotate, j2_rotate, j3_rotate, j4_rotate, j5_rotate],
        }
      );
      // 毎回送るのはよくないと思うけどな。。。
      mqttclient.publish('lss4dof/state', msg);
    } else {
      //      console.log("MQTT ", mqttclient);
    }
  }, [j1_rotate, j2_rotate, j3_rotate, j4_rotate, j5_rotate])



  React.useEffect(() => {
    if (nodes.length > 0) {
      WRIST_IK(source, target, nodes)
    }
  }, [target, wrist_deg])




  const WRIST_IK = (st, tg, nd) => {
    const wknd = [...nd]

    let wk_node2pos = wknd[2]
    let wk_node3pos = wknd[3]
    const wkdistance1 = joint_length[0] + joint_length[1]
    const wkdistance2 = joint_length[2]
    const wkdistance1_mini = Math.abs(joint_length[0] - joint_length[1])
    let wkdistance3 = Math.min(wkdistance1 + wkdistance2, distance(st, tg))
    let wk_0_2_distance_diff = -1
    const deg1 = degree(st, tg)

    do {
      const { a: wk_y, b: radius } = calc_side_1(wkdistance3, deg1.x)
      const { a: wk_z, b: wk_x } = calc_side_1(radius, deg1.y)
      wk_node3pos = pos_add(st, { x: wk_x, y: wk_y, z: wk_z })

      const { a: teihen, b: takasa } = calc_side_1(wkdistance2, wrist_deg)
      const { a: teihen2, b: takasa2 } = calc_side_1(takasa, deg1.y)

      wk_node2pos = { ...wk_node3pos }
      wk_node2pos.x = wk_node3pos.x - takasa2
      wk_node2pos.y = wk_node2pos.y - teihen
      wk_node2pos.z = wk_node3pos.z - teihen2

      wk_0_2_distance_diff = wkdistance1 - distance(st, wk_node2pos)
      if (distance(st, wk_node2pos) < wkdistance1_mini) {
        console.log("impossible location!")
        return
      }
      wkdistance3 = wkdistance3 + wk_0_2_distance_diff
    } while (wk_0_2_distance_diff < 0)

    const { direction, angle1, angle2 } = degree_base(wknd[0], wk_node2pos, joint_length[0], joint_length[1])
    const { a: node1y, b: node1r } = calc_side_1(joint_length[0], angle1)
    const { a: node1z, b: node1x } = calc_side_1(node1r, direction)
    const wk_node1pos = pos_add(wknd[0], { x: node1x, y: node1y, z: node1z })

    wknd[1] = wk_node1pos
    wknd[2] = wk_node2pos
    wknd[3] = wk_node3pos

    set_nodes([...wknd])

    set_j1_rotate(direction)
    set_j2_rotate(angle1)
    set_j3_rotate(angle2)
    const wkdeg = degree(wk_node1pos, wk_node2pos)
    if ((Math.sign(wk_node2pos.x) !== Math.sign(wk_node3pos.x) && Math.sign(wk_node2pos.z) !== Math.sign(wk_node3pos.z)) ||
      (wk_node2pos.x === 0 && wk_node3pos.x === 0) || (wk_node2pos.z === 0 && wk_node3pos.z === 0)) {
      set_j4_rotate(-wkdeg.x - wrist_deg)
    } else {
      set_j4_rotate(wrist_deg - wkdeg.x)
    }
  }

  const degree_base = (s_pos, t_pos, side_a, side_b) => {
    const side_c = distance(s_pos, t_pos)
    const diff_x = (t_pos.x + 10) - (s_pos.x + 10)
    const diff_y = (t_pos.y + 10) - (s_pos.y + 10)
    const diff_z = (t_pos.z + 10) - (s_pos.z + 10)
    let direction = Math.round((Math.atan2(diff_x, diff_z) * 180 / Math.PI) * 10000) / 10000
    if (isNaN(direction)) direction = 0
    if (Math.abs(direction) === 180) {
      direction = 180
    }

    let angle_base = Math.round((Math.atan2(Math.sqrt(side_c ** 2 - diff_y ** 2), diff_y) * 180 / Math.PI) * 10000) / 10000
    if (isNaN(angle_base)) angle_base = 0

    let angle_B = Math.round((Math.acos((side_a ** 2 + side_c ** 2 - side_b ** 2) / (2 * side_a * side_c)) * 180 / Math.PI) * 10000) / 10000
    let angle_C = Math.round((Math.acos((side_a ** 2 + side_b ** 2 - side_c ** 2) / (2 * side_a * side_b)) * 180 / Math.PI) * 10000) / 10000

    if (isNaN(angle_B)) angle_B = 0
    if (isNaN(angle_C)) angle_C = 0

    const angle1 = Math.round((angle_base - angle_B) * 10000) / 10000
    const angle2 = angle_C === 0 ? 0 : 180 - angle_C

    return { direction, angle_base, angle1, angle2 }
  }

  const degree = (s_pos, t_pos) => {
    const len = distance(s_pos, t_pos)
    const diff_x = (t_pos.x + 10) - (s_pos.x + 10)
    const diff_y = (t_pos.y + 10) - (s_pos.y + 10)
    const diff_z = (t_pos.z + 10) - (s_pos.z + 10)

    let degree_x = Math.round((Math.atan2(Math.sqrt(len ** 2 - diff_y ** 2), diff_y) * 180 / Math.PI) * 10000) / 10000
    let degree_y = Math.round((Math.atan2(diff_x, diff_z) * 180 / Math.PI) * 10000) / 10000

    if (isNaN(degree_x)) degree_x = 0
    if (isNaN(degree_y)) degree_y = 0

    return { x: degree_x, y: degree_y }
  }

  const calc_side_1 = (syahen, kakudo) => {
    const teihen = Math.abs(kakudo) === 90 ? 0 : (syahen * Math.cos(kakudo / 180 * Math.PI))
    const takasa = Math.abs(kakudo) === 180 ? 0 : (syahen * Math.sin(kakudo / 180 * Math.PI))
    return { a: teihen, b: takasa }
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

        add_vr_component(AFRAME, { set_target, set_grip, set_trigger });
        VR_mode_detector(AFRAME);

        // mqtt
        console.log("Connecting MQTT");
        connectMQTT(() => (0));
      }
    }
  }, [typeof window])

  const controllerProps = {
    robotName, robotNameList, set_robotName,
    target, set_target, wrist_deg, set_wrist_deg,
    j1_rotate, set_j1_rotate, j2_rotate, set_j2_rotate, j3_rotate, set_j3_rotate,
    j4_rotate, set_j4_rotate, j5_rotate, set_j5_rotate,
    c_pos_x, set_c_pos_x, c_pos_y, set_c_pos_y, c_pos_z, set_c_pos_z,
    c_deg_x, set_c_deg_x, c_deg_y, set_c_deg_y, c_deg_z, set_c_deg_z
  }

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
        <a-scene xr-mode-ui="enterAREnabled: true; XRMode: xr" vr-mode-detector>
          <Abox {...aboxprops} />
          {
            //       <a-plane position="0 0 0" rotation="-90 0 0" width="10" height="10" color="#7BC8A4" shadow></a-plane>

          }
          <Assets />
          <a-entity id="ctlR" laser-controls="hand: right" raycaster="showLine: true" vr-ctrl-listener="hand: right"></a-entity>

          <Select_Robot {...robotProps} />
          <a-entity light="type: directional; color: #FFF; intensity: 0.8" position="1 2 1"></a-entity>
          <a-entity light="type: directional; color: #FFF; intensity: 0.8" position="-1 1 2"></a-entity>
          <a-entity id="rig" position={`${c_pos_x} ${c_pos_y} ${c_pos_z}`} rotation={`${c_deg_x} ${c_deg_y} ${c_deg_z}`}>
            <a-entity id="camera" camera cursor="rayOrigin: mouse;" look-controls wasd-controls position="0 -0.3 0">
              <a-text id="txt" value="text" position="0.3 -0.1 -1" scale="0.2 0.2 0.2" align="center" color="#800000"></a-text>
              <a-text id="txt2" value="0,0,0" position="0.3 -0.2 -1" scale="0.2 0.2 0.2" align="center" color="#805000"></a-text>
              <a-text id="txt3" value="0,0,0" position="0.3 -0.30 -1" scale="0.2 0.2 0.2" align="center" color="#805000"></a-text>
            </a-entity>
          </a-entity>

          <a-sphere position={edit_pos(target)} scale="0.012 0.012 0.012" color="yellow" visible={true}></a-sphere>
        </a-scene>
        <Controller {...controllerProps} />
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









