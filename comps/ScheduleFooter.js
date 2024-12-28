import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Main.module.css";
import { useState } from "react";

export default function ScheduleFooter(){

    const [linkedin_hover, setLinkedInHover] = useState(false);
    const [github_hover, setGithubHover] = useState(false);

    return (
        <div className={styles.schedule_footer_container}>
            <center>
                {/* <div style={{display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", justifyContent: "center", margin: "12px"}}>
                        <Link target="_blank" href="mailto:almc8368@colorado.edu">Contact</Link>
                        <Link target="_blank" href="https://paypal.me/c7dev">Donate</Link>
                </div> */}
                <div style={{display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "10px", fontSize: "10pt", paddingBottom: "", margin: "14px"}}>
                    <div>
                        <span style={{color: "#999"}}>Created by Alex McDonald</span>
                    </div>
                    <div style={{marginTop: "2px"}}>
                        <Link target="_blank" href="https://www.linkedin.com/in/alexm01/" onMouseOver={() => setLinkedInHover(true)} onMouseOut={() => setLinkedInHover(false)}>
                            <Image src={linkedin_hover ? "/icons/linkedin_hover.png" : "/icons/linkedin.png"} width="18" height="18" alt="LinkedIn"></Image>
                        </Link>
                    </div>
                    <div style={{marginTop: "2px"}}>
                        <Link target="_blank" href="https://www.github.com/standardProton/cu_scheduler" onMouseOver={() => setGithubHover(true)} onMouseOut={() => setGithubHover(false)}>
                            <Image src={github_hover ? "/icons/github_hover.png" : "/icons/github.png"} width="18" height="18" alt="GitHub Source"></Image>
                        </Link>
                    </div>
                </div>
            </center>
        </div>
    );

}