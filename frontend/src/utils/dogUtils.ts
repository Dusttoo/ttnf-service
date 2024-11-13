export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Available For Stud':
            return '#E76F00'; // Primary theme color
        case 'Sold':
            return '#6c757d'; // Neutral/dim color to indicate sold
        case 'Stud':
            return '#F9AA33'; // Secondary button color for prominence
        case 'Retired':
            return '#FF4C4C'; // Error color to imply inactive
        case 'Available':
            return '#a84824'; // Accent color to draw attention
        case 'Active':
            return '#28a745'; // Green for active status
        case 'ABKC Champion':
            return '#FFD700'; // Gold to signify an award or achievement
        case 'Production':
            return '#2D2D2D'; // Secondary theme color to indicate standard status
        default:
            return '#E0E0E0'; // Default neutral background
    }
};