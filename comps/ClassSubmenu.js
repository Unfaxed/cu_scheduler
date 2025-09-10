import styles from "../styles/Main.module.css";
import {getInstructorList } from "../lib/utils.js";
import { name_map } from "../lib/json/name_map.js";
import React from "react";
import BackArrow from "../comps/BackArrow";
import { Checkbox, List, ListItem, ListItemText, Select, MenuItem } from '@mui/material';

export default function ClassSubmenu({cl, state, submit}) {
    /*
    <div style={{display: "flex"}}>
                            <input type="checkbox" 
                            checked={cl.avoid_instructors == undefined || !cl.avoid_instructors.includes(instructor)} 
                            onChange={Change}
                            label={"instr-enabled-" + j}
                            id={"instr-enabled-" + j}></input>

                            <div style={{marginLeft: "5px"}} onClick={Change}>
                                <label for={"instr-enabled-" + j}>{instructor}</label>
                            </div>
                        </div>
                        */

    const handleEnrolledChange = (e) => {
        const selected = e.target.value;
        if (selected == 0) delete cl.enrolled_section;
        else cl.enrolled_section = selected;
        state.setPreSchedule([...state.preschedule]);
        submit();
    }

    const instr_list = getInstructorList(cl);

    return (<>
        <div style={{display: "flex", marginTop: "15px"}}>
            <BackArrow onClick={() => {
                state.setClassSubmenu(null)
                if (submit != undefined) submit();
            }}></BackArrow>
            <div style={{marginTop: "10px", marginLeft: "5px", fontSize: "18pt"}}>
                <span><b>{cl.title + " (" + cl.type + ")"}</b></span>
            </div>
        </div>
        <div style={{marginTop: "5px", marginLeft: "5px"}}>
            <span>{name_map[cl.title]}</span>
            <div style={{marginTop: "15px", fontSize: "14pt"}}>
                <a target="_blank" className={styles.link_colored} href={"https://viz-public.cu.edu/t/Boulder/views/Class_Search_Crse_FCQ/FCQResults?Subject-Course=" + cl.title.replace(" ", "-")}>See Evaluations</a>
            </div>

            {/* Enrolled section dropdown */}
            <div style={{marginTop: "30px"}}>
                <div style={{marginBottom: "10px"}}>
                    <span>Enrolled Section:</span>
                </div>
                <Select 
                value={cl.enrolled_section || 0}
                sx={{color: "white", width: "90%"}}
                onChange={handleEnrolledChange}>
                    <MenuItem value={0}>None</MenuItem>
                    {cl.offerings.map((offering) => (
                        <MenuItem value={offering.section}>{"Section " + offering.section}</MenuItem>
                    ))}
                </Select>
            </div>
            {instr_list.length > 0 && (<div style={{marginTop: "30px", marginBottom: "35px", color: cl.enrolled_section != undefined ? "#999" : "inherit"}}>
                <div> 
                    <span>Preferred Instructors:</span>
                </div>
                {/* List of instructors, with event when checkbox clicked */}
                <List>
                    {instr_list.map((instructor, i) => {

                        const handleChange = (checked) => {
                            if (cl.enrolled_section != undefined) return;
                            if (cl.avoid_instructors == undefined) cl.avoid_instructors = [];
                           
                            if (!checked) cl.avoid_instructors.splice(cl.avoid_instructors.indexOf(instructor), 1);
                            else cl.avoid_instructors.push(instructor);

                            state.setPreSchedule([...state.preschedule]);
                        }

                        const checked = cl.avoid_instructors == undefined || !cl.avoid_instructors.includes(instructor);

                        return (
                            <ListItem key={"avoid-instr-" + i + "-container"} button onClick={() => handleChange(checked)} style={{paddingLeft: "0", paddingBottom: "0", paddingTop: "0"}}>
                                <Checkbox id={"avoid-instr-" + i} style={{paddingLeft: "0"}} 
                                    checked={checked}
                                    sx={{color: "white"}}
                                    disabled={cl.enrolled_section != undefined}></Checkbox>
                                <ListItemText primary={instructor}></ListItemText>
                            </ListItem>
                        );
                    })}
                </List>
            </div>)}
        </div>
    </>);
}