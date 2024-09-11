declare module 'dompurify' {
    export interface Config {
        ADD_TAGS?: string[];
        ADD_ATTR?: string[];
        ALLOWED_TAGS?: string[];
        ALLOWED_ATTR?: string[];
        FORBID_TAGS?: string[];
        FORBID_ATTR?: string[];
        SAFE_FOR_JQUERY?: boolean;
        SAFE_FOR_TEMPLATES?: boolean;
        ALLOW_DATA_ATTR?: boolean;
        USE_PROFILES?: false | { mathMl?: boolean, svg?: boolean, svgFilters?: boolean, html?: boolean };
        SANITIZE_DOM?: boolean;
        RETURN_DOM?: boolean;
        RETURN_DOM_FRAGMENT?: boolean;
        RETURN_DOM_IMPORT?: boolean;
        RETURN_TRUSTED_TYPE?: boolean;
        WHOLE_DOCUMENT?: boolean;
        KEEP_CONTENT?: boolean;
        IN_PLACE?: boolean;
    }

    export interface DOMPurifyI {
        sanitize(source: string | Node, config?: Config): string;
        addHook(hook: 'beforeSanitizeElements' | 'afterSanitizeElements' | 'beforeSanitizeAttributes' | 'afterSanitizeAttributes' | 'beforeSanitizeShadowDOM', callback: (node: Element) => void): void;
        removeHook(hook: string): void;
        isValid(source: string | Node, config?: Config): boolean;
    }

    const DOMPurify: DOMPurifyI;
    export default DOMPurify;
}