import { useState, useEffect } from "react";
import "./CountDown.css";
export default function Timer({ Till }) {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const diff = Till - now;


    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return (
        <div className="Block">
        <div className="Block hr">{hours}h: </div>
        <div className="Block mi">{minutes}m: </div>
        <div className="Block sec">{seconds}s: </div> 
        </div>
    );
}
