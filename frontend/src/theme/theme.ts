export const theme = {
    colors: {
        primary: "#E76F00", // Primary Color (Orange)
        secondary: "#2D2D2D", // Secondary Color (Dark Background)
        accent: "#a84824", // Accent Color (Light Orange)
        neutralBackground: "#1F1F1F", // Dark Neutral Background for the main sections
        secondaryBackground: "#393939", // Slightly lighter background for content containers
        cardBackground: "#4A4A4A",
        white: "#F8F9EE", // White
        black: "#000000", // Black
        text: "#E0E0E0", // Light grey for text to enhance readability
        textSecondary: "#A0A0A0", // Dimmed text for less important text areas
        error: '#FF4C4C', // Error color
    },
    fonts: {
        primary: "Roboto, Arial, sans-serif", // Primary Font
        secondary: "Oswald, sans-serif", // Secondary Font
    },
    ui: {
        button: {
            primary: {
                background: "#E76F00", // Keep the bright primary button
                color: "#F8F9EE", // Light text for contrast
            },
            secondary: {
                background: "#393939", // Darker secondary button background
                color: "#E0E0E0", // Light text color for accessibility
            },
        },
        input: {
            background: "#393939", // Darker input background
            border: "#E76F00", // Orange border to make inputs stand out
            color: "#E0E0E0", // Light text color for input readability
        },
        nav: {
            background: "#2D2D2D", // Dark navigation background
            color: "#F8F9EE", // Light text in nav links
            hover: "#E76F00", // Hover color for interaction feedback
        },
    },
};