import Image from "next/image";
import Link from "next/link";
import styles from "styles/Main.module.css";

export default function ScheduleFooter(){

    return (
        <div className={styles.schedule_footer_container}>
            <center>
                <div style={{display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", justifyContent: "center", margin: "12px"}}>
                        <Link target="_blank" href="mailto:almc8368@colorado.edu">Contact</Link>
                        <Link target="_blank" href="https://paypal.me/c7dev">Donate</Link>
                </div>
                <div style={{fontSize: "10pt", color: "#999", paddingBottom: "14px"}}>
                    <span>Created by Alex McDonald</span>
                </div>
            </center>
        </div>
    );

}