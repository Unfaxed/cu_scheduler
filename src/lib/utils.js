
export function isRangeIntersection(range, ranges) {
    for (let i = 0; i < ranges.length; i++){
        if (range[0] < ranges[i][1] && range[1] > ranges[i][0]) return true;
    }
    return false;
}
export function isRangeIntersectionSingle(range1, range2) {
    return (range1[0] < range2[1] && range1[1] > range2[0]);
}

export function isSameSchedule(sch1, sch2){ //check if 2 schedules are effectively identical, regardless of order
    if(sch1.classes.length != sch2.classes.length) return false;
    const start_times = {};
    for (let i = 0; i < sch1.classes.length; i++){
        const cl = sch1.classes[i];
        start_times[cl.title + " " + cl.type] = cl.meeting_times;
    }
    const start_times2 = {};
    for (let i = 0; i < sch2.classes.length; i++){
        const cl = sch2.classes[i];
        start_times2[cl.title + " " + cl.type] = cl.meeting_times;
    }
    for (const [cl, meetings] of Object.entries(start_times)){
        if (start_times2[cl] == undefined || JSON.stringify(start_times2[cl]) != JSON.stringify(meetings)) return false;
    }
    return true;
}

export function timeString(day, start, end){ //model time
    const day_str = ["M", "T", "W", "Th", "F"];
    function twoDigit(x){
        if (x < 9) return "0" + x;
        else return "" + x;
    }

    return day_str[day] + " " + (((Math.trunc(start/12)+7) % 12)+1) + ":" + twoDigit((start % 12) * 5) + (start >= 60 ? "p" : "a") + "-" + (((Math.trunc(end/12)+7) % 12)+1) + ":" + twoDigit((end % 12) * 5) + (end >= 60 ? "p" : "a");
}

export function groupScheduleClasses(classes){ //[{name: "CSCI 1200", type: "REC"}, {name: "CSCI 1200", type: "LEC"}] -> [{name: "CSCI 1200", types: ["LEC", "REC"]}], +other data, assumed unique
    const cl_map = {};
    for (let i =0; i < classes.length; i++){
        const cl = classes[i];
        if (cl_map[cl.title] == undefined) cl_map[cl.title] = {sections: [cl.section + " (" + cl.type + ")"]};
        else cl_map[cl.title].sections.push(cl.section + " (" + cl.type + ")");
    }

    const r = [];
    for (const [title, val] of Object.entries(cl_map)){
        r.push({title, sections: val.sections});
    }
    return r;
}

export function getInstructorList(pr_class){ //preschedule class
    const r = [];
    for (let i = 0; i < pr_class.offerings.length; i++){
        const k = pr_class.offerings[i].instructor;
        if (k.length > 0 && !r.includes(k)) r.push(k);
    }
    return r;
}

export function prescheduleClassCount(preschedule, code){
    var count = 0;
    for (let i = 0; i < preschedule.length; i++) {
        if (preschedule[i].title.toLowerCase() == code.toLowerCase()) count++;
    }
    return count;
}

export function removeOverlappingUT(day, avoid_times){ //merge unavailable times that overlap
    const r = [];
    avoid_times[day].sort((a, b) => a[0] - b[0])

    var max_r = null;
    var max_i = 0;
    for (let i = 0; i < avoid_times[day].length; i++){
        const range = avoid_times[day][i];
        if (max_r == null) {
            r.push(range);
            max_r = range[1];
            max_i = i;
        }
        else if (range[0] > max_r) {
            max_r = range[1];
            max_i = i;
            r.push(range);
        }
        else if (max_r < range[1]){ //overlapping
            r[max_i][1] = range[1];
            max_r = range[1];
        }
    }

    avoid_times[day] = r;

    return avoid_times;
}