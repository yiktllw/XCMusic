
export function isLocal(id: number | string) {
    if (typeof id === 'string') {
        return id.includes('/') || id.includes('\\') || id.includes('_');
    }
    return false;
}
