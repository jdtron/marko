import { Option, program } from 'commander';
import macros from './macros';
import views from './views';

program
    .name(macros.executableName)
    .version(await macros.appVersion)
    .description('Terminal bookmark manager')
    .option('-t | --tmux', 'Display in tmux popup and open files in tmux ')
    .addOption(new Option('--tmux-popup').hideHelp())
    .action(views.open);

program.parse();
