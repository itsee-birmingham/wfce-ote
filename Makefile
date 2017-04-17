VERSION=$(shell grep "var wfce_editor" wce-ote/plugin/plugin.js | cut -f2 -d\"|sed 's/[-()]//g'|sed 's/ /-/g')
TARBALL=wce-ote-${VERSION}.tar.gz

unpack: clean
	unzip tinymce_*_dev.zip
	mv tinymce/* tinymce/.??* .
	rmdir tinymce

release: unpack
	rm -f ${TARBALL}
	tar czfv ${TARBALL} `ls -ad *|grep -v tar.gz|grep -v .zip`

clean:
	rm -rf `ls -ad * .??*|grep -v wce-ote|grep -v *.zip|grep -v Makefile |grep -v .git|grep -v README`
	rm -rf *.tar.gz
