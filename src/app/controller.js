"use client";
import * as React from 'react'
import "./controller.css";

export default function Controller(props) {
  const {robotNameList, robotName} = props
  const {target, wrist_deg} = props
  const {j1_rotate, j2_rotate, j3_rotate, j4_rotate, j5_rotate} = props
  const {c_pos_x, c_pos_y, c_pos_z} = props
  const {c_deg_x, c_deg_y, c_deg_z} = props
  

  const set_robotName = (e)=>{
    props.set_robotName(e.target.value)
  }

  const set_j1_rotate = (e)=>{
    let value = e.target.value
    if(Math.abs(value)===180){
      value = value * -1
    }
    props.set_j1_rotate(value)
  }

  const set_j2_rotate = (e)=>{
    let value = e.target.value
    if(Math.abs(value)===180){
      value = value * -1
    }
    props.set_j2_rotate(value)
  }

  const set_j3_rotate = (e)=>{
    let value = e.target.value
    if(Math.abs(value)===180){
      value = value * -1
    }
    props.set_j3_rotate(value)
  }

  const set_j4_rotate = (e)=>{
    let value = e.target.value
    if(Math.abs(value)===180){
      value = value * -1
    }
    props.set_j4_rotate(value)
  }

  const set_j5_rotate = (e)=>{
    let value = e.target.value
    if(Math.abs(value)===180){
      value = value * -1
    }
    props.set_j5_rotate(value)
  }

  const set_c_pos_x = (e)=>{
    let value = e.target.value
    props.set_c_pos_x(value)
  }

  const set_c_pos_y = (e)=>{
    let value = e.target.value
    props.set_c_pos_y(value)
  }

  const set_c_pos_z = (e)=>{
    let value = e.target.value
    props.set_c_pos_z(value)
  }

  const set_c_deg_x = (e)=>{
    let value = e.target.value
    props.set_c_deg_x(value)
  }

  const set_c_deg_y = (e)=>{
    let value = e.target.value
    props.set_c_deg_y(value)
  }

  const set_c_deg_z = (e)=>{
    let value = e.target.value
    props.set_c_deg_z(value)
  }

  const set_target_x = (e)=>{
    const value = Number.parseFloat(e.target.value)
    props.set_target({...target,x:value||0})
  }
  const set_target_y = (e)=>{
    const value = Number.parseFloat(e.target.value)
    props.set_target({...target,y:value||0})
  }
  const set_target_z = (e)=>{
    const value = Number.parseFloat(e.target.value)
    props.set_target({...target,z:value||0})
  }

  const set_wrist_deg = (e)=>{
    let value = e.target.value
    props.set_wrist_deg(value)
  }

  return (
    <>
      <div className="controller" >
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="j1_rotate_number" className="form-label"><span className="form-control-plaintext">J1 Deg</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="j1_rotate_number" value={j1_rotate} onChange={set_j1_rotate} min={-180} max={180}/></div>
        </div>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="j2_rotate_number" className="form-label"><span className="form-control-plaintext">J2 Deg</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="j2_rotate_number" value={j2_rotate} onChange={set_j2_rotate} min={-180} max={180}/></div>
        </div>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="j3_rotate_number" className="form-label"><span className="form-control-plaintext">J3 Deg</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="j3_rotate_number" value={j3_rotate} onChange={set_j3_rotate} min={-180} max={180}/></div>
        </div>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="j4_rotate_number" className="form-label"><span className="form-control-plaintext">J4 Deg</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="j4_rotate_number" value={j4_rotate} onChange={set_j4_rotate} min={-180} max={180}/></div>
        </div>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="j5_rotate_number" className="form-label"><span className="form-control-plaintext">J5 Deg</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="j5_rotate_number" value={j5_rotate} onChange={set_j5_rotate} min={-180} max={180}/></div>
        </div>
      </div>
      <div className="camera-controller" >
        <span>TARGET</span>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="target_x_number" className="form-label"><span className="form-control-plaintext">target x</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="target_x_number" value={target.x} onChange={set_target_x} step={0.01} min={-10} max={10}/></div>
        </div>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="target_y_number" className="form-label"><span className="form-control-plaintext">target y</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="target_y_number" value={target.y} onChange={set_target_y} step={0.01} min={-10} max={10}/></div>
        </div>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="target_z_number" className="form-label"><span className="form-control-plaintext">target z</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="target_z_number" value={target.z} onChange={set_target_z} step={0.01} min={-10} max={10}/></div>
        </div>
        <div className="row mb-4">
        </div>

        <span>WRIST DEG</span>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="wrist_deg_number" className="form-label"><span className="form-control-plaintext">wrist Deg</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="wrist_deg_number" value={wrist_deg} onChange={set_wrist_deg} min={0} max={180}/></div>
        </div>
        <div className="row mb-4">
        </div>

        <span>CAMERA</span>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="c_pos_x_number" className="form-label"><span className="form-control-plaintext">pos X</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="c_pos_x_number" value={c_pos_x} onChange={set_c_pos_x} step={0.01}/></div>
        </div>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="c_pos_y_number" className="form-label"><span className="form-control-plaintext">pos Y</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="c_pos_y_number" value={c_pos_y} onChange={set_c_pos_y} step={0.01}/></div>
        </div>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="c_pos_z_number" className="form-label"><span className="form-control-plaintext">pos Z</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="c_pos_z_number" value={c_pos_z} onChange={set_c_pos_z} step={0.01}/></div>
        </div>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="c_deg_x_number" className="form-label"><span className="form-control-plaintext">deg X</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="c_deg_x_number" value={c_deg_x} onChange={set_c_deg_x} step={0.1}/></div>
        </div>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="c_deg_y_number" className="form-label"><span className="form-control-plaintext">deg Y</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="c_deg_y_number" value={c_deg_y} onChange={set_c_deg_y} step={0.1}/></div>
        </div>
        <div className="row mb-2">
          <div className="col-md-4"><label htmlFor="c_deg_z_number" className="form-label"><span className="form-control-plaintext">deg Z</span></label></div>
          <div className="col-md-8"><input type="number" className="form-control" id="c_deg_z_number" value={c_deg_z} onChange={set_c_deg_z} step={0.1}/></div>
        </div>
      </div>
    </>
    )
}
