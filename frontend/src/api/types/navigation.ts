export interface NavLink {
    id: string;
    title: string;
    slug: string;
    editable: boolean;
    subLinks?: NavLink[];
}