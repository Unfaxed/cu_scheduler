
import Head from "next/head.js";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import styles from "../styles/Main.module.css";
import Image from "next/image";
import { removeOverlappingUT, UTCount, groupScheduleClasses, prescheduleClassCount } from "../lib/utils.js";
import { lookup_map } from "../lib/json/lookup_map.js";
import { name_map } from "../lib/json/name_map.js";
import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import React from "react";
import Popup from "../comps/Popup";
import ListElement from "../comps/ListElement";
import ClassSubmenu from "../comps/ClassSubmenu";
import Schedule from "../comps/Schedule";
import Settings from "../comps/Settings";
import ScheduleFooter from "../comps/ScheduleFooter";
import { sha256 } from "js-sha256"
import { DEFAULT_SEMESTER, YEAR_DB_INFO, MAX_MODEL_TIME } from "../lib/json/consts";

export function getServerSideProps(context){
    let srcdb = YEAR_DB_INFO[DEFAULT_SEMESTER.toLowerCase().replace(" ", "")];
    let semester = DEFAULT_SEMESTER;

    if (context.query != undefined && context.query.semester != undefined){
        const srcdb_lookup = YEAR_DB_INFO[context.query.semester.replace("-", "")];
        if (srcdb_lookup != undefined) {
            srcdb = srcdb_lookup;
            semester = context.query.semester;
        }
    }

    return {
        props: {
            analytics: !process.env.DEV_ENV,
            srcdb,
            semester
        }
    }
}

export class SchedulePage {

    constructor ({analytics, srcdb, semester}) {
        this.analytics = analytics;
        this.srcdb = srcdb;
        this.semester = semester;

        this.setScheduleData = () => {}; // stub for setter

        //define states
        [this.schedule_svg, this.setScheduleSVG] = useState(null);
        [this.loading, this.setLoading] = useState(false);
        [this.status_message, this.setStatusText] = useState("Brought to you by a fellow Buff!");
        [this.preschedule, this.setPreSchedule] = useState([]);
        [this._schedule, this.setScheduleData] = useState({
            classes: [],
            avoid_times: [[], [], [], [], []]
        });
        [this.submitted, this.setSubmitted] = useState(false);
        [this.await_submit, this.setAwaitSubmit] = useState(false);
        [this.class_suggestions, this.setClassSuggestions] = useState([]);
        [this.color_key, this.setColorKey] = useState({});
        [this.ut_editing, this.setUTEditing] = useState(null); //[day, index, top]
        [this.full_schedule_set, this.setFullScheduleSet] = useState([[]]);
        [this.selected_schedule_index, this.setSelectedScheduleIndex] = useState(0);
        [this.conflict_class, this.setConflictingClass] = useState(null);
        [this.checklist_visible, this.setChecklistVisible] = useState(false);
        [this.menu_shown, this.setMenuShown] = useState(true);
        [this.show_menu_x, this.setShowMenuXButton] = useState(false);
        [this.checklist_selected, this.setChecklistSelected] = useState([]); 
        [this.results_cache, this.setResultsCache] = useState({});
        [this.class_submenu, this.setClassSubmenu] = useState(null);
        [this.avoid_waitlist, this.setAvoidWaitlist] = useState(true);

        //effect hooks
        useEffect(this.onScheduleUpdateEffect, [this.schedule, this.preschedule, this.ut_editing, this.submitted]);
        useEffect(() => this.submit(), [this.avoid_waitlist]);
    }

    get schedule() {
        return this._schedule;
    }

    set schedule(newSchedule) {
        if (!newSchedule) newSchedule = {};

        newSchedule.classes = newSchedule.classes ?? this.schedule.classes ?? [];
        newSchedule.avoid_times = newSchedule.avoid_times ?? this.schedule.avoid_times ?? [[], [], [], [], []];

        this.setScheduleData(newSchedule);
        this._schedule = newSchedule;
    }

    searchBoxType = (event) => { //search & show class name suggestions
        const t = event.target.value;
        const suggestions = [];
        if (t.length == 0) {
            this.setClassSuggestions([]);
            return;
        }
        const word_split = t.split(" ");

        if (word_split.length >= 2){
            const code = (word_split[0] + " " + word_split[1]).toUpperCase().replace(":", "");
            if (name_map[code] != undefined) suggestions.push(code);
        }

        for (let i = 0; i < word_split.length; i++){
            const word = word_split[i].toLowerCase();
            if (word.length > 3){
                const res = lookup_map[word];
                if (res != undefined) {
                    for (let j = 0; j < res.length; j++) {
                        let add = true;
                        //intersect the results for each word in search
                        if (!suggestions.includes(res[j])){
                        for (let k = 0; k < word_split.length; k++){
                            if (i != k && !name_map[res[j]].toLowerCase().includes(word_split[k].toLowerCase())) {
                                add = false;
                                break;
                            }
                        }
                        if (add) suggestions.push(res[j]);
                        }
                    }
                }
            }
        }

        this.setClassSuggestions(suggestions);
    }

    update = () => { //refresh schedule states and fit to screen size
        let width = window.innerWidth;
        if (this.menu_shown){
            if (window.innerWidth > 650) { //update with phone threshold
                const css_percentage = 0.25, css_min = 270, css_max = 410; //menu1 class
                const percent = window.innerWidth*css_percentage;
    
                if (percent < css_min) width = window.innerWidth - css_min;
                else if (percent > css_max) width = window.innerWidth - css_max;
                else width = window.innerWidth*(1-css_percentage);
            }
            if (this.submitted) width -= 55;
        }

        this.setShowMenuXButton(window.innerWidth <= 750);

        const options = {
            scheduleClickUp: (x, y) => this.scheduleClick(x, y, true),
            removeUT: this.removeUT
        }

        this.setScheduleSVG(
            <Schedule width={width} height={(window.innerHeight*0.9)-4} state={this} 
                scheduleClick={this.scheduleClick} options={options}></Schedule>
        ); //render schedule
    }

    onScheduleUpdateEffect = () => {
        if (!window) return;

        if (this.await_submit) {
            this.submit();
            this.setAwaitSubmit(false);
        }

        window.addEventListener("beforeunload", (event) => {
            if (this.preschedule.length == 0) return;
            let confirmationMessage = 'Changes you made may not be saved.';
        
            (event || window.event).returnValue = confirmationMessage; //Gecko + IE
            return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
        });

        this.update();
        window.addEventListener("resize", this.update);
        document.onkeydown = async (event) => {
            if (event.keyCode == 13){ //enter
                const textinput = document.getElementById("class-search").value;
                this.addPrescheduleClass(textinput);
            }
            else if (event.keyCode == 27){
                this.setUTEditing(null);
            }
        }

        const search_box = document.getElementById("class-search");

        if (search_box != null) search_box.addEventListener("input", this.searchBoxType);

        return () => {
            window.removeEventListener("resize", this.update);
            if (search_box != null) search_box.removeEventListener("input", this.searchBoxType);
        }
    }

    scheduleClick = (day, time, is_upclick) => { //click event listener
        if (this.ut_editing == null && !is_upclick){
            let start = Math.max(0, time - 6);
            let avoid_times = this.schedule.avoid_times;
            avoid_times[day].push([start, Math.min(start + 12, MAX_MODEL_TIME)]);
            avoid_times = removeOverlappingUT(day, avoid_times);
            this.schedule = {classes: this.schedule?.classes, avoid_times: this.avoid_times};
            this.submit();
        } else { //save after edit
            const avoid_times = removeOverlappingUT(day, this.schedule?.avoid_times);
            this.setUTEditing(null);
            this.schedule = {classes: this.schedule?.classes, avoid_times: this.avoid_times};
            this.submit();
        }
    }

    scheduleHover = (day, time) => {
        const ut_editing = this.ut_editing;
        if (ut_editing != null) {
            const avoid_times = this.schedule.avoid_times;
            const ut = avoid_times[ut_editing.day][ut_editing.index];
            if ((ut_editing.top && time > ut[1]-4) || (!ut_editing.top && time < ut[0]+4)) return;
            ut[ut_editing.top ? 0 : 1] = time;
            avoid_times[ut_editing.day][ut_editing.index] = ut;

            this.schedule = {classes: this.schedule.classes, avoid_times};
        }
    }

    removeUT = (day, index) => {
        const ut_list = this.schedule.avoid_times;
        ut_list[day].splice(index, 1);
        this.setAwaitSubmit(true);
        this.setUTEditing(null);
        this.schedule = {classes: this.schedule?.classes, avoid_times: ut_list};
    }

    addPrescheduleClass = async (class_code) => { //user can type in class or select from suggestion dropdown, fetch data from backend
        if (class_code.length == 0 || this.loading) return;
        const class_code_split = class_code.split(" ");
        if (class_code_split.length != 2 || class_code_split[0].length != 4 || class_code_split[1].length != 4) return; //class code format (ex. CSCI 1000)

        this.setClassSuggestions([]);
        this.setLoading(true);

        const preschedule_add_f = await fetch("/api/class_data?" + new URLSearchParams({name: class_code, srcdb: this.srcdb})); //fetch data from api
        const preschedule_add = await preschedule_add_f.json();
        if (preschedule_add != null) {
            if (preschedule_add.length == prescheduleClassCount(this.preschedule, class_code)) {
                this.setLoading(false);
                return;
            }
            for (let i = 0; i < preschedule_add.length; i++){
                let add = true;
                for (let j = 0; j < this.preschedule.length; j++){
                    if (this.preschedule[j].title == preschedule_add[i].title && this.preschedule[j].type == preschedule_add[i].type) {
                        add = false;
                        break;
                    }
                }
                if (add) this.preschedule.push(preschedule_add[i]);
            }
        } else {
            this.setStatusText("❌ Could not find this class!");
            this.setLoading(false);
            return;
        }

        this.setClassSubmenu(null);
        this.setPreSchedule(this.preschedule); //update state
        this.submit(class_code);
        document.getElementById("class-search").value = "";

    }

    removePrescheduleClass = (cl) => {
        const nps = [];
        for (let j = 0; j < preschedule.length; j++) {
            if (preschedule[j].title != cl.title || preschedule[j].type != cl.type) nps.push(preschedule[j]);
        }
        this.setClassSubmenu(null);
        this.setAwaitSubmit(true);
        this.setPreSchedule(nps);
    }

    submit = async (lastAddedClass) => { //send preschedule to optimizer to generate schedule suggestions
        const preschedule = this.preschedule;
        if (this.loading) return;
        if (this.preschedule == null || this.preschedule.length == 0) {
            this.schedule = {classes: [], avoid_times: this.schedule.avoid_times};
            this.setFullScheduleSet([[]]);
            this.setSelectedScheduleIndex(0);
            this.setSubmitted(false);
            return;
        }

        const pre2 = [];
        for (let i = 0; i < preschedule.length; i++){
            const cl = {...preschedule[i]};
            if (preschedule[i].enrolled_section != undefined){
                cl.offerings = []; 
                for (let j = 0; j < preschedule[i].offerings.length; j++){
                    if (preschedule[i].offerings[j].section == preschedule[i].enrolled_section) {
                        cl.offerings.push(preschedule[i].offerings[j]);
                        break;
                    }
                }
            }
            if (cl.offerings.length > 0) pre2.push(cl);
        }
        
        const params = JSON.stringify({
            avoid_times: this.schedule.avoid_times,
            avoid_waitlist: this.avoid_waitlist,
            preschedule: pre2
        });

        const hash = sha256(params);
        let res;
        let cached = false;
        if (this.results_cache[hash] != undefined){
            res = this.results_cache[hash];
            cached = true;
        } else {
            this.setLoading(true);
            const res1 = await fetch("/api/optimizer", {
                method: "POST",
                body: params
            });
            res = await res1.json();

            if (res1.status != 200 || res.schedules == undefined){
                console.error(res.error_msg);
                this.setLoading(false);
                this.setStatusText("❌ There was an error!");
                return;
            }

            this.results_cache[hash] = res;
            this.setResultsCache(this.results_cache);
        }

        this.setLoading(false);

        if (!res.conflictions) { //success
            let schedule_index = this.selected_schedule_index;
            
            if (!cached || this.schedule?.classes?.length != preschedule.length || res.schedules.length <= schedule_index){
                this.setSelectedScheduleIndex(0);
                schedule_index = 0;
            }
            
            const s = {classes: res.schedules[schedule_index].classes};
            s.avoid_times = this.schedule?.avoid_times;
            this.setFullScheduleSet(res.schedules);
            this.schedule = s;
            this.setSubmitted(true);
            this.setStatusText("");

            if (this.conflict_class != null){
                if (this.prescheduleClassCount(preschedule, this.conflict_class) == 0) this.setConflictingClass(null);
            }

        } else { //at least 1 class has to be dropped from the preschedule list
            this.setStatusText("❌ Impossible to fit this class!");
            this.setSubmitted(false);
            this.schedule = {classes: [], avoid_times: this.schedule.avoid_times};
            if (lastAddedClass != null && this.conflict_class == null) this.setConflictingClass(lastAddedClass.toUpperCase());
        }
    }

}

export default function Index({analytics, srcdb, semester}) {

    const schedulePage = new SchedulePage({analytics, srcdb, semester});

    return(
        <>
        <Head>
            <link rel="icon" href="/favicon.png"></link>
            <title>#1 CU Boulder Schedule Builder | Make Your Schedule Perfect in only 60 Seconds</title>
            <meta name="description" content="Cut down on stress and supercharge your sleep schedule with an optimized class schedule! Fit your courses around your work schedule and personal time."></meta>
            {analytics && (
                <>
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-N7V5MK9YDW"></script>
                <script>
                  {"window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}; gtag('js', new Date()); gtag('config', 'G-N7V5MK9YDW');"}
                </script>
                </>
            )}
        </Head>
        <div className={styles.main_container}>
            {schedulePage.menu_shown && (<><div className={styles.menu1}>
                {schedulePage.show_menu_x && (<div style={{position: "absolute", top: "10px", right: "-30px", cursor: "pointer"}} onClick={() => {schedulePage.setMenuShown(false); schedulePage.setUTEditing(null);}}>
                    <Image src="/icons/close.png" alt="Close Menu" width="21" height="21"></Image>
                </div>)}


                <div className={styles.menu1_settings}>
                    <TextField fullWidth label="Enter your classes" sx={{input: {color: "white", background: "#37373f"}}} id="class-search"></TextField>
                    
                    {/* Class name suggestions */}
                    {schedulePage.class_suggestions.length > 0 && (<div className={styles.class_suggestions}>
                        {schedulePage.class_suggestions.map((cs, i) => (
                            <div className={styles.class_suggestion + " " + (i % 2 == 0 ? styles.class_suggestion_a : styles.class_suggestion_b)} onClick={() => schedulePage.addPrescheduleClass(cs)} key={"class-suggestion-" + i}>
                                {cs + ": " + (name_map[cs] || "No Description")}
                            </div>
                        ))}
                    </div>)}

                    {schedulePage.class_submenu == null ? (<>
                        {/* Main settings view, shows class list */}
                        <div style={{marginTop: "15px"}}>
                            <div className={styles.card} style={schedulePage.preschedule.length == 0 ? {} : {paddingTop: 0}}>
                                {schedulePage.preschedule.map((cl, i) => (
                                    <ListElement key={"class-chip-" + i} text={cl.title + " " + cl.type} onClick={(event) => {
                                        schedulePage.setClassSubmenu(i)
                                    }} onDelete={() => schedulePage.removePrescheduleClass(cl)} error={cl.title == schedulePage.conflict_class}></ListElement>
                                ))}
                                {schedulePage.preschedule.length == 0 && (<div style={{paddingLeft: "12px"}}>
                                    <span style={{fontSize: "8pt", color: "rgba(255, 255, 255, 0.50)"}}>Search your classes to begin</span>
                                </div>)}
                            </div>
                        </div>
                        <div style={{marginTop: "15px", marginLeft: "5px"}}>
                            <span style={{fontSize: "9pt", color: "rgba(255, 255, 255, 0.5)"}}>Click the schedule to set unavailable times</span>
                        </div>
                        <div style={{marginTop: "30px"}}>
                            <Settings semester={schedulePage.semester} state={schedulePage}></Settings>
                        </div>
                    </>) : (<>
                        {/* Class settings view */}
                        <ClassSubmenu cl={schedulePage.preschedule[schedulePage.class_submenu]} state={schedulePage} submit={schedulePage.submit}></ClassSubmenu>
                    </>)}
                </div>

                {/* Bottom loading gif & registration checklist */}
                <div className={styles.menu1_submit}>
                    {schedulePage.class_submenu == null && (<div style={{position: "absolute", top: "-40px", fontSize: "12pt", width: "calc(100% - 20px)"}}>
                        <center>
                            <span><b>{schedulePage.status_message}</b></span>
                        </center>
                    </div>)}
                    
                    {schedulePage.loading && (<div style={{marginTop: "6px", marginRight: "10px"}}>
                        <Image src="/loading.gif" width="32" height="32" alt="Loading"></Image>
                    </div>)}
                    <Button variant={(schedulePage.loading || schedulePage.classes?.length == 0) ? "disabled" : "contained"} onClick={() => schedulePage.setChecklistVisible(true)} style={{backgroundColor: "#CFB87C"}}>SHOW CHECKLIST</Button>
                </div>
            </div>
            </>)}

            {/* Schedule container */}
            <div className={styles.schedule_container}>
                <div style={{display: "flex", flexWrap: "nowrap"}}>
                    {schedulePage.submitted && (<div>
                        {schedulePage.full_schedule_set.map((schedule_set, i) => (
                            <div key={"schedule-number-" + i} style={schedulePage.selected_schedule_index == i ? {borderRight: "4px solid #FFF", backgroundColor: "#2c2c34"} : {}} className={styles.full_schedule_select_number} onClick={() => {
                                schedulePage.schedule = {avoid_times: schedulePage.avoid_times, classes: schedulePage.full_schedule_set?.[i].classes};
                                schedulePage.setSelectedScheduleIndex(i);
                            }}>
                                <span><b>{i+1}</b></span>
                            </div>
                        ))}
                    </div>)}
                    <div>
                        <div>
                            {schedulePage.schedule_svg}
                        </div>
                    </div>
                </div>
                <ScheduleFooter></ScheduleFooter>
            </div>
        </div>

        {/* Registration checklist */}
        <Popup setVisible={schedulePage.setChecklistVisible} visible={schedulePage.checklist_visible}>
            <div className={styles.checklist_container}>
                <div style={{marginBottom: "20px"}}>Registration Checklist:</div>
            {groupScheduleClasses(schedulePage.schedule.classes).map((checklist, i) => (
                <div className={styles.checklist_element} key={"checklist-group-" + i}>
                    <span style={{fontSize: "20pt"}}><b>{checklist.title }</b>{": " + name_map[checklist.title]}</span>
                    <div>
                        {checklist.sections.map(section => (
                            <FormControlLabel label={<Typography variant="label2">{"Section " + section}</Typography>} control = {
                            <Checkbox id={"checkbox-" + checklist.title + " " + section} 
                            size="medium" sx={{color: "white"}} 
                            defaultChecked={schedulePage.checklist_selected.includes(checklist.title + " " + section)} 
                            onChange={() => {
                                const checklist_selected = schedulePage.checklist_selected;
                                if (checklist_selected.includes(checklist.title + " " + section)){
                                    schedulePage.setChecklistSelected(checklist_selected.filter(el => el != (checklist.title + " " + section)));
                                    return;
                                } else {
                                    checklist_selected.push(checklist.title + " " + section);
                                    schedulePage.setChecklistSelected([...checklist_selected]);
                                }
                            }}></Checkbox>}></FormControlLabel>
                        ))}
                    </div>
                </div>
            ))}
            </div>
        </Popup>

        {/* Menu icon for mobile */}
        {!schedulePage.menu_shown && (<div style={{position: "fixed", left: "10px", top: "10px", cursor: "pointer"}} onClick={() => {schedulePage.setMenuShown(true); setUTEditing(null);}}>
            <Image src="/icons/menu.png" alt="Show menu" width="25" height="25"></Image>
        </div>)}
        </>
    );
}