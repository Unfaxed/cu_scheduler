import Image from "next/image";
import Link from "next/link";
import styles from "styles/Main.module.css";

export default function ScheduleFooter(){

    return (
        <div className={styles.schedule_footer_container}>
            <div style={{display: "flex", flexWrap: "wrap", gap: "45px", alignItems: "center", justifyContent: "center", margin: "15px"}}>
                <Link target="_blank" href="mailto:almc8368@colorado.edu">Contact</Link>
                <Link target="_blank" href="https://paypal.me/c7dev">Donate</Link>
            </div>
        </div>
    );

}