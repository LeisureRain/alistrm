let ALIST_TOKEN: string = "";

export function get(): string {
    return ALIST_TOKEN;
}

export function set(token: string): void {
    ALIST_TOKEN = token;
}