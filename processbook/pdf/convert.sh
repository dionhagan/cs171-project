# temporary hacky way to generate one PDF from multiple iPython notebooks
# Ref: http://gotofritz.net/blog/howto/joining-pdf-files-in-os-x-from-the-command-line/
#jupyter nbconvert --to latex ../*.ipynb
"/System/Library/Automator/Combine PDF Pages.action/Contents/Resources/join.py" -o ../processbook.pdf *.pdf
