import React from "react";

type SvgPosition = "pos1" | "pos2" | "pos3";

interface Props {
    /**
     * "pos1" pour la pose originale (yeux rect),
     * "pos2" pour la pose modifiée (yeux en SVG path + rotation + translation du petit cercle),
     * "pos3" : same as pos1 but with
     *   • yeux plats (33×13 px) à la place des rectangles clignotants,
     *   • le chemin de paupière remplacé par un petit SVG de 67×11 px.
     */
    pos?: SvgPosition;
}

const TransformingSvg: React.FC<Props> = ({ pos = "pos1" }) => {
    const isPos2 = pos === "pos2";
    const isPos3 = pos === "pos3";

    // 1) Durée de l'animation "float" selon la position
    //    - pos1 : 4s (inchangé)
    //    - pos2 : 3s (un peu plus rapide)
    //    - pos3 : 5s (un peu plus lent)
    const floatDuration = isPos2 ? "2s" : isPos3 ? "6s" : "4s";

    const floatStyle: React.CSSProperties = {
        animation: `float ${floatDuration} ease-in-out infinite`,
    };

    // Angle de rotation pour pos2
    const rotationAngle = -12; // degrés
    const rotateCx = 181;
    const rotateCy = 275;

    // Wrapper pour pos3 : on force TOUJOURS une valeur de transform et de transition,
    // afin que le retour vers pos1/pos2 se fasse en douceur.
    const outerTranslateStyle: React.CSSProperties = {
        transform: isPos3 ? "translate(0px, 45px)" : "translate(0px, 0px)",
        transition: "transform 0.5s ease",
    };

    // Styles pour la rotation/transition du groupe principal (pos2)
    const groupStyle: React.CSSProperties = {
        transform: `rotate(${isPos2 ? rotationAngle : 0}deg)`,
        transformOrigin: `${rotateCx}px ${rotateCy}px`,
        transition: "transform 0.5s ease",
    };

    // Translation du petit cercle droit si pos2 (avec transition toujours active)
    const smallCircleStyle: React.CSSProperties = {
        transform: isPos2 ? "translate(-55px, -104px)" : "translate(0px, 0px)",
        transition: "transform 0.5s ease",
    };

    // Styles pour opacité des yeux rectangles (pos1 uniquement)
    const eyeRectStyle: React.CSSProperties = {
        opacity: pos === "pos1" ? 1 : 0,
        transition: "opacity 0.5s ease",
    };
    // Styles pour opacité des yeux SVG (pos2 uniquement)
    const eyeSvgStyle: React.CSSProperties = {
        opacity: isPos2 ? 1 : 0,
        transition: "opacity 0.5s ease",
    };
    // Styles pour opacité des yeux plats (pos3 uniquement)
    const eyeFlatStyle: React.CSSProperties = {
        opacity: isPos3 ? 1 : 0,
        transition: "opacity 0.5s ease",
    };

    // Styles pour le chemin de paupière original (visible si !pos3)
    const lidOrigStyle: React.CSSProperties = {
        opacity: isPos3 ? 0 : 1,
        transition: "opacity 0.5s ease",
    };
    // Styles pour le petit SVG de paupière à plat (pos3 uniquement)
    const lidFlatStyle: React.CSSProperties = {
        opacity: isPos3 ? 1 : 0,
        transition: "opacity 0.5s ease",
    };

    return (
        <svg
            width="362"
            height="469"
            viewBox="0 0 362 469"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <style>{`
        .blink {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          animation: blink 5s infinite;
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0); }
        }

        @keyframes float {
          0%   { transform: translateY(20px); }
          50%  { transform: translateY(-20px); }
          100% { transform: translateY(20px); }
        }
      `}</style>

            {/* 1) Éléments immuables (ellipse au sol) */}
            <ellipse
                cx="181"
                cy="454.5"
                rx="96"
                ry="14.5"
                fill="black"
                fillOpacity="0.08"
            />

            {/* 2) Wrapper pour pos3 */}
            <g style={outerTranslateStyle}>
                {/* 3) Groupe flottant : on applique le style floatStyle */}
                <g style={floatStyle}>
                    <circle cx="53.5" cy="359.5" r="43.5" fill="#B0E0E6" />

                    {/* 4) Groupe rotatif/transformable */}
                    <g style={groupStyle}>
                        {/* Cercle principal */}
                        <circle cx="181" cy="275" r="76" fill="#93A8B1" />

                        {/* Bras / gants */}
                        <path
                            d="M0 170.977C0 147.474 21.8884 130.097 44.7785 135.428L73 142V236L49.1617 244.817C25.3252 253.633 0 235.998 0 210.583V170.977Z"
                            fill="#B0E0E6"
                        />
                        <path
                            d="M362 213.023C362 236.526 340.112 253.903 317.222 248.572L289 242L289 148L312.838 139.183C336.675 130.367 362 148.002 362 173.417L362 213.023Z"
                            fill="#B0E0E6"
                        />

                        {/* Corps / buste */}
                        <rect x="171" y="46" width="20" height="59" fill="#1C3255" />
                        <circle cx="181" cy="29" r="29" fill="#B0E0E6" />

                        <path
                            d="M26 161.178C26 120.692 51.7855 86.4739 92.1141 82.9112C114.433 80.9395 143.296 79.5002 180 79.5002C216.847 79.5002 245.991 80.9507 268.619 82.9342C309.562 86.5231 336 121.32 336 162.42V218.979C336 261.348 307.817 295.58 265.5 297.684C243.939 298.756 216.27 299.5 181 299.5C145.73 299.5 118.061 298.756 96.5003 297.684C54.1834 295.58 26 261.348 26 218.979V161.178Z"
                            fill="#B8D0DA"
                        />

                        <path
                            d="M62 160.724C62 133.89 79.0135 111.095 105.706 108.332C123.766 106.463 148.27 105 180.729 105C213.326 105 238.104 106.476 256.445 108.356C283.545 111.135 301 134.306 301 161.549V220.587C301 248.673 282.389 271.504 254.353 273.176C236.776 274.224 213.093 275 181.5 275C149.907 275 126.224 274.224 108.647 273.176C80.6112 271.504 62 248.673 62 220.587V160.724Z"
                            fill="#1C3255"
                        />
                        {/* Petit cercle droit, avec translation sur pos2 */}
                        <circle
                            cx="309.5"
                            cy="359.5"
                            r="43.5"
                            fill="#B0E0E6"
                            style={smallCircleStyle}
                        />

                        {/* Masque pour les mains intérieures */}
                        <mask
                            id="mask0_160_122"
                            style={{ maskType: "alpha" }}
                            maskUnits="userSpaceOnUse"
                            x="62"
                            y="105"
                            width="239"
                            height="170"
                        >
                            <path
                                d="M62 160.724C62 133.89 79.0135 111.095 105.706 108.332C123.766 106.463 148.27 105 180.729 105C213.326 105 238.104 106.476 256.445 108.356C283.545 111.135 301 134.306 301 161.549V220.587C301 248.673 282.389 271.504 254.353 273.176C236.776 274.224 213.093 275 181.5 275C149.907 275 126.224 274.224 108.647 273.176C80.6112 271.504 62 248.673 62 220.587V160.724Z"
                                fill="#1C3255"
                            />
                        </mask>
                        <g mask="url(#mask0_160_122)">
                            {/* 4a) Version pos1 : deux rectangles clignotants */}
                            <g style={eyeRectStyle}>
                                <rect
                                    x="100"
                                    y="153"
                                    width="33"
                                    height="73"
                                    rx="10"
                                    fill="#B0E0E6"
                                    className="blink"
                                />
                                <rect
                                    x="230"
                                    y="153"
                                    width="33"
                                    height="73"
                                    rx="10"
                                    fill="#B0E0E6"
                                    className="blink"
                                />
                            </g>

                            {/* 4b) Version pos2 : petites formes SVG en visuel d’œil */}
                            <g style={eyeSvgStyle} transform="translate(100 153)">
                                <svg
                                    width="33"
                                    height="73"
                                    viewBox="0 0 34 32"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M0.773605 10.8168C0.773605 5.29393 5.25076 0.816789 10.7736 0.816789H23.7736C29.2965 0.816789 33.7736 5.29394 33.7736 10.8168V29.4347C33.7736 31.6159 30.7789 32.2218 29.9309 30.2123L26.2513 21.4919C22.7697 13.2409 11.031 13.3747 7.73836 21.7029L4.63352 29.556C3.82222 31.6081 0.773605 31.0273 0.773605 28.8207V10.8168Z"
                                        fill="#B0E0E6"
                                    />
                                </svg>
                            </g>
                            <g style={eyeSvgStyle} transform="translate(230 153)">
                                <svg
                                    width="33"
                                    height="73"
                                    viewBox="0 0 34 32"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M0.773605 10.8168C0.773605 5.29393 5.25076 0.816789 10.7736 0.816789H23.7736C29.2965 0.816789 33.7736 5.29394 33.7736 10.8168V29.4347C33.7736 31.6159 30.7789 32.2218 29.9309 30.2123L26.2513 21.4919C22.7697 13.2409 11.031 13.3747 7.73836 21.7029L4.63352 29.556C3.82222 31.6081 0.773605 31.0273 0.773605 28.8207V10.8168Z"
                                        fill="#B0E0E6"
                                    />
                                </svg>
                            </g>

                            {/* 4c) Version pos3 : deux SVG plats (33×13 px) */}
                            <g style={eyeFlatStyle} transform="translate(100 193)">
                                <svg
                                    width="33"
                                    height="13"
                                    viewBox="0 0 33 13"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect width="33" height="13" rx="6.5" fill="#B0E0E6" />
                                </svg>
                            </g>
                            <g style={eyeFlatStyle} transform="translate(230 193)">
                                <svg
                                    width="33"
                                    height="13"
                                    viewBox="0 0 33 13"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect width="33" height="13" rx="6.5" fill="#B0E0E6" />
                                </svg>
                            </g>

                            {/* Forme intermédiaire pour les paupières fermées */}
                            {/*   – version originale (visible si !pos3) */}
                            <g style={lidOrigStyle}>
                                <path
                                    d="M148 222.333C148 219.388 150.388 217 153.333 217H209.667C212.612 217 215 219.388 215 222.333V222.333C215 237.061 203.061 249 188.333 249H174.667C159.939 249 148 237.061 148 222.333V222.333Z"
                                    fill="#B0E0E6"
                                />
                            </g>
                            {/*   – nouvelle version pour pos3 : petit SVG 67×11 px */}
                            <g style={lidFlatStyle} transform="translate(148 222.333)">
                                <svg
                                    width="67"
                                    height="11"
                                    viewBox="0 0 67 11"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M0 5.5C0 2.46243 2.46243 0 5.5 0H61.5C64.5376 0 67 2.46243 67 5.5V5.5C67 8.53757 64.5376 11 61.5 11H5.5C2.46243 11 0 8.53757 0 5.5V5.5Z"
                                        fill="#B0E0E6"
                                    />
                                </svg>
                            </g>

                            {/* Décors additionnels inchangés */}
                            <rect
                                x="177.379"
                                y="73.8604"
                                width="58.8046"
                                height="216.567"
                                transform="rotate(31.6151 177.379 73.8604)"
                                fill="url(#paint0_linear_160_122)"
                            />
                            <rect
                                x="266.291"
                                y="90.9302"
                                width="30.8997"
                                height="216.567"
                                transform="rotate(31.6151 266.291 90.9302)"
                                fill="url(#paint1_linear_160_122)"
                            />
                        </g>
                    </g>
                </g>
            </g>

            <defs>
                <linearGradient
                    id="paint0_linear_160_122"
                    x1="206.781"
                    y1="73.8604"
                    x2="206.781"
                    y2="290.427"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#45679F" />
                    <stop offset="0.778846" stopColor="#1C3255" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_160_122"
                    x1="281.74"
                    y1="90.9302"
                    x2="281.74"
                    y2="307.497"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#45679F" />
                    <stop offset="0.778846" stopColor="#1C3255" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export default TransformingSvg;
