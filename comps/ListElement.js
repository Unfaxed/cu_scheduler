import styles from "styles/Main.module.css";
import Image from "next/image";

export default function ListElement({text, key, onClick, onDelete}){
    
    return (<div className={styles.list_element} key={key}>
        <div style={{width: "100%", padding: "17px", paddingBottom: "0", minHeight: "40px"}} onClick={() => onClick()}>
            <span>{text}</span>
        </div>
        <div style={{position: "absolute", right: "13px", top: "15px"}} onClick={() => onDelete()}>
            <Image src="/icons/close.png" alt="Delete" width="14" height="14"></Image>
        </div>
    </div>);
}
