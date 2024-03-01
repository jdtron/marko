BIN_NAME = marko
ZSH_LINE = 'source ${HOME}/.local/bin/${BIN_NAME}_zsh.sh'
BASH_LINE = 'source ${HOME}/.local/bin/${BIN_NAME}_bash.sh'
PREFIX = /usr/local/bin

default:
	@echo 'Please choose exact target' >&2
	@exit 1

install:
	install -Dm755 src/${BIN_NAME}.sh ${PREFIX}/${BIN_NAME}

zsh:
	install -Dm755 src/shell.sh ${HOME}/.local/bin/${BIN_NAME}_zsh.sh
	cp ${HOME}/.zshrc ${HOME}/.zshrc.bak
	grep ${ZSH_LINE} ${HOME}/.zshrc >/dev/null || echo ${ZSH_LINE} >> ${HOME}/.zshrc

bash:
	install -Dm755 src/shell.sh ${HOME}/.local/bin/${BIN_NAME}_bash.sh
	cp ${HOME}/.bashrc ${HOME}/.bashrc.bak
	grep ${BASH_LINE} ${HOME}/.bashrc >/dev/null || echo ${BASH_LINE} >> ${HOME}/.bashrc
