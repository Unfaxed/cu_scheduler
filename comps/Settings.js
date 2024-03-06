
import { Checkbox, ListItem, ListItemText, Select, MenuItem } from '@mui/material';

export default function Settings({semester, State}){

    const semesters = ["Fall 2024", "Summer 2024", "Spring 2024", "Fall 2023"];
    const curr = semester == null ? "summer 2024" : semester.replace("-", " ").toLowerCase();

    const handleWaitlistChange = () => {
        State.setAvoidWaitlist(!State.avoid_waitlist);
    }

    return (
        <>
        <div>
            <Select size="small" value={1} sx={{color: "white", width: "100%"}}> 
                {semesters.map((sem, i) => {
                    if (semesters[i].toLowerCase() == curr) return (
                        <MenuItem value={1} key={"semester-" + i}>{sem}</MenuItem>
                    );
                    else return (
                        <a key={"semester-" + i} href={"/?semester=" + sem.toLowerCase().replace(" ", "-")}><MenuItem>{sem}</MenuItem></a>
                    )
                })}
            </Select>
        </div>
        <div className='pointer_hover'>
            <ListItem style={{paddingLeft: "0", paddingBottom: "0", paddingTop: "10px"}}>
                <Checkbox sx={{color: "white"}}
                onClick={handleWaitlistChange}
                checked={State.avoid_waitlist}>
                </Checkbox>
                <ListItemText onClick={handleWaitlistChange}>Avoid Waitlisted Classes</ListItemText>
            </ListItem>
        </div>
        </>
    );
}