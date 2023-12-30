import styles from "styles/Main.module.css";
import {getInstructorList } from "lib/utils.js";
import { name_map } from "lib/json/name_map.js";
import React from "react";
import BackArrow from "../comps/BackArrow";
import { Checkbox, List, ListItem, ListItemText, Container } from '@mui/material';

export default function ClassSubmenu({cl, State, submit}) {
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

    return (<>
        <div style={{display: "flex", marginTop: "15px"}}>
            <BackArrow onClick={() => {
                State.setClassSubmenu(null)
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
            <div style={{marginTop: "30px", marginBottom: "35px"}}>
                <div> 
                    <span>Preferred Instructors:</span>
                </div>
                <List>
                    {getInstructorList(cl).map((instructor, i) => {

                        const handleChange = () => {
                            if (cl.avoid_instructors == undefined) cl.avoid_instructors = [];

                            const checkbox = document.getElementById("avoid-instr-" + i);
                            if (checkbox){
                                console.log("checkbox not null :3");
                                checkbox.checked = !checkbox.checked; 
                            }
                           
                            if (cl.avoid_instructors.includes(instructor)) {
                                cl.avoid_instructors.splice(cl.avoid_instructors.indexOf(instructor), 1);
                            } else {
                                cl.avoid_instructors.push(instructor);
                            }

                            State.setPreSchedule(State.preschedule);
                            console.log(cl.avoid_instructors);
                        }

                        return (
                            <ListItem key={"avoid-instr-" + i + "-container"} button onClick={handleChange} style={{paddingLeft: "0", paddingBottom: "0", paddingTop: "0"}}>
                                <Checkbox id={"avoid-instr-" + i} style={{paddingLeft: "0"}} defaultChecked={cl.avoid_instructors == undefined || !cl.avoid_instructors.includes(instructor)}></Checkbox>
                                <ListItemText primary={instructor}></ListItemText>
                            </ListItem>
                        );
                    })}
                </List>
            </div>
        </div>
    </>);
}