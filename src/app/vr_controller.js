"use client";
import * as React from 'react'


export const VR_INFO_Camera = () => {
    <a-entity id="camera" camera cursor="rayOrigin: mouse;" look-controls position="0 -0.3 0">
        <a-text id="txt" value="text" position="0.3 0 -1" scale="0.4 0.4 0.4" align="center" color="#800000"></a-text>
        <a-text id="txt2" value="0,0,0" position="0.3 -0.15 -1" scale="0.4 0.4 0.4" align="center" color="#805000"></a-text>
        <a-text id="txt3" value="0,0,0" position="0.3 -0.30 -1" scale="0.4 0.4 0.4" align="center" color="#805000"></a-text>
    </a-entity>
}

export const VR_Controller_Right = () => {
    <a-entity id="ctlR" laser-controls="hand: right" raycaster="showLine: true" vr-ctrl-listener="hand: right"></a-entity>
}
export const VR_Controller_Left = () => {
    <a-entity id="ctlL" laser-controls="hand: left" raycaster="showLine: true" vr-ctrl-listener="hand: left"></a-entity>
}

export const VR_mode_detector = (myaframe) => {
    myaframe.registerComponent('vr-mode-detector', {
        init: function () {
            var el = this.el;
            el.sceneEl.addEventListener('enter-vr', function () {
                console.log('VRモードが開始されました');
                myaframe.vrmode = true;
                //              set_controller();
            });
            el.sceneEl.addEventListener('exit-vr', function () {
                console.log('VRモードが終了しました');
                myaframe.vrmode = false;
                // VRモード終了時の関数を呼び出す
            });
        }
    });
}

export const add_vr_component = (myaframe, props) => {
    const { set_target, set_trigger, set_grip, set_abutton, set_bbutton, set_vr_quartanion } = props;
    myaframe.registerComponent('vr-ctrl-listener', {
        init: function () {
            const txt = document.getElementById("txt");
            const txt2 = document.getElementById("txt2");

            console.log("listener regist!", txt, txt2)

            this.el.addEventListener('gripdown', function (event) {
                console.log("value", "Right grip down");
                txt.setAttribute("value", "Right grip down");
                set_grip(true);
            });
            this.el.addEventListener('gripup', function (event) {
                console.log("value", "Right grip up");
                txt.setAttribute("value", "Right grip up");
                set_grip(false);
            });

            this.el.addEventListener('triggerdown', function (event) {
                console.log("value", "Right grip down");
                txt.setAttribute("value", "Right TriggerDown");
                set_trigger(true);
            });
            this.el.addEventListener('triggerup', function (event) {
                console.log("value", "Right grip up");
                txt.setAttribute("value", "Right TriggerUp");
                set_trigger(false);
            });
            this.el.addEventListener('abuttondown', function (event) {
                txt.setAttribute("value", "Right A-button down");
                set_abutton(true);
            });
            this.el.addEventListener('abuttonup', function (event) {
                txt.setAttribute("value", "Right A-button Up");
                set_abutton(false);
            });
            this.el.addEventListener('bbuttondown', function (event) {
                txt.setAttribute("value", "Right B-button down");
                set_bbutton(true);
            });
            this.el.addEventListener('bbuttonup', function (event) {
                txt.setAttribute("value", "Right B-button Up");
                set_bbutton(false);
            });

        },
        tick: function () {
            //            console.log("Controller tick!", this.el.object3D);
            const txt2 = document.getElementById("txt2");
            const txt3 = document.getElementById("txt3");
            var p = this.el.object3D.position;
            var q = this.el.object3D.quaternion;
            txt2.setAttribute("value", "R-Pos: " + p.x.toFixed(2) + ", " + p.y.toFixed(2) + ", " + p.z.toFixed(2));

            //
            // we need to check VR mode.
            if (myaframe.vrmode) {
                set_target({ x: p.x, y: p.y, z: p.z + 0.15 });
                set_vr_quartanion(q);
            }

            txt3.setAttribute("value", "Q: " + q.x.toFixed(2) + ", " + q.y.toFixed(2) + ", " + q.z.toFixed(2) + ", " + q.w.toFixed(2));

        }
    });

}
