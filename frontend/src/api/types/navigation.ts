export interface NavLink {
    id: number;
    title: string;
    slug: string;
    editable: boolean;
    parentId?: number;
    position: number;
    subLinks?: NavLink[];
}