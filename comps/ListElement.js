import styles from "styles/Main.module.css";
import Image from "next/image";

export default function ListElement({text, key, onClick, onClose}){
    
    return (<div onClick={() => onClick()} className={styles.list_element} key={key}>
        <div>
            <span>{text}</span>
        </div>
        <div style={{position: "absolute", right: "13px", top: "15px"}} onClick={() => onClose()}>
            <Image src="/icons/close.png" alt="Delete" width="14" height="14"></Image>
        </div>
    </div>);
}
