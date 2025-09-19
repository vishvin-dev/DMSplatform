import React, { useState, useEffect } from 'react';

const WelcomePage = () => {
    const [userName, setUserName] = useState("Guest");
    const [userInitial, setUserInitial] = useState("G");

    useEffect(() => {
        try {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            if (authUser?.user?.Email) {
                const namePart = authUser.user.Email.split('@')[0];
                const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                setUserName(capitalizedName);
                setUserInitial(capitalizedName.charAt(0).toUpperCase());
            }
        } catch (error) {
            console.error("Could not parse authUser from session storage:", error);
        }
    }, []);

    const pageStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;600&display=swap');

        .elegant-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #ffffff;
            font-family: 'Montserrat', sans-serif;
            text-align: center;
            position: relative; /* Required for the ::before pseudo-element */
            overflow: hidden; /* Ensures pseudo-element doesn't overflow */
        }

        /* This pseudo-element holds the background image */
        .elegant-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1; /* Sits behind the content */
            
            /* The background image URL and properties */
            background-image: url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1920&q=80');
            background-size: cover;
            background-position: center;
            
            /* The requested low opacity */
            opacity: 0.06;
        }

        .elegant-avatar, .elegant-text-group {
            position: relative;
            z-index: 2; /* Ensures content is on top of the background */
        }

        .elegant-avatar {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            background: linear-gradient(135deg, #28a745, #22c55e);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 4.5rem;
            font-weight: 600;
            margin-bottom: 2.5rem;
            box-shadow: 0 4px 20px rgba(40, 167, 69, 0.4);
            
            /* Animation */
            transform: scale(0.8);
            opacity: 0;
            animation: elegantAvatarIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .elegant-text-group {
            opacity: 0;
            transform: translateY(20px);
            animation: elegantTextIn 0.8s 0.4s ease-out forwards;
        }

        .elegant-text-group h1 {
            font-size: 2.8rem;
            font-weight: 600;
            color: #343a40;
            margin: 0 0 0.5rem 0;
        }

        .elegant-text-group p {
            font-size: 1.4rem;
            font-weight: 300;
            color: #6c757d;
            margin: 0;
        }

        @keyframes elegantAvatarIn {
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        @keyframes elegantTextIn {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;

    return (
        <>
            <style>{pageStyles}</style>
            <div className="elegant-container">
                <div className="elegant-avatar">
                    <span>{userInitial}</span>
                </div>
                <div className="elegant-text-group">
                    <h1>Welcome, {userName}</h1>
                    <p>Accessing Secure GESCOM Document Portal</p>
                </div>
            </div>
        </>
    );
};

export default WelcomePage;

