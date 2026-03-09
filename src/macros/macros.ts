import { execSync } from 'child_process';

export function appNameMacro() {
    return Bun.env.APP_NAME ?? 'marko';
}

export function executableNameMacro() {
    return Bun.env.EXECUTABLE_NAME ?? 'marko-tui';
}

export async function appVersionMacro() {
    return execSync('git describe --tags').toString('utf8');
}
