import styles from "../styles/Main.module.css";
import Image from "next/image";


export default function BackArrow({size, onClick}){
    if (size == undefined) size = 24;
    return (
        <div className={styles.back_arrow} onClick={() => onClick()}>
            <Image src="/icons/back_arrow.png" height={size} width={size} alt="Back"></Image>
        </div>
    )
}