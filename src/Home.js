import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return(
        <div style = {{ textalign: "center",
            marginTop: "100px"}}>
                <h1> A4station</h1>
                <p>Upload & Print Document Easily</p>
                <button
                onClick={() => navigate ("/print")}
                style={{ padding: "10px 20px",
                    frontSize:"18px"
                }}
                >
                    Start Printing
                </button>
            </div>
    );

}