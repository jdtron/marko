import {
    appNameMacro,
    appVersionMacro,
    executableNameMacro,
} from './macros' with { type: 'macro' };

export default {
    appName: appNameMacro(),
    executableName: executableNameMacro(),
    appVersion: appVersionMacro(),
};
