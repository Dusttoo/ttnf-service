export interface NavLink {
    id: string;
    title: string;
    slug: string;
    editable: boolean;
    parentId?: number;
    position: number;
    subLinks?: NavLink[];
}