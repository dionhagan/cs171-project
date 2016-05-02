"""
Publish.py - take a set of iPython notebooks, export them to HTML and publish them to a public website

Usage: python publish.py
       notebook allows publishing of only a single notebook. By default, all notebooks listed
       below will be published.
"""

import argparse
import os
from urllib import quote_plus
import subprocess

# Contains: chapter number, notebook filename, chapter title
# if the chapter is number 0, do not put a "Chapter n - " prefix
chapter_list = [
    ['1','1overview','Overview'],
    ['2','2related','Related Work'],
#    ['3','3questions','Questions Addressed'],
    ['3','4data','Data Sources'],
    ['4','5eda','Exploratory Data Analysis'],
    ['5','6evolution','Evolution'],
    ['6','7implementation','Implementation'],
    ['7','8evaluation','Evaluation']
    ]

DESTDIR = '../../projectwebsite/cs171-project/processbook/'
PREFIX = 'jupyter nbconvert --to html --output ' + DESTDIR

def striptags(file):
    """
    Since the resulting file will be pulled into a wrapper document,
    the surrounding <HTML>, <HEAD> and <BODY> tags have to stripped
    """
    # we are checking only the first 6 characters rather reading the whole file into Soup
    tags_to_strip = ['<!DOCT','<html>','<head>','<title','</body','</html']
    f = open(DESTDIR+file+'.html',"r+")
    d = f.readlines()
    f.seek(0)
    for i in d:
        if i[0:6] not in tags_to_strip:
            f.write(i)
    f.truncate()
    f.close()

def convert(file):
    ret = 0
    cmd = PREFIX + file + '.html ' + file + '.ipynb'
    ret = subprocess.call(cmd, shell=True)
    if ret == 0: striptags(file)
    return ret

def update_index(optionstr):
    f = open('index.html',"r+")
    d = f.readlines()
    f.seek(0)
    for i in d:
        if i.lstrip()[0:7] == '<option':
            if (not inoption):
                for j in optionstr:
                    f.write(j)
                inoption = True
        else:
            inoption = False
            f.write(i)
    f.truncate()
    f.close()


def main():
    #parser = argparse.ArgumentParser()
    #args = parser.parse_args()

    newoptions = []
    for i in chapter_list:
        convert(i[1])
        str = '\t\t\t\t<option value="' + i[1] + '.html">'
        if i[0] != '0':
            str = str + "Chapter "+i[0]+" - "
        str = str + i[2] + "</option>" + '\n'
        newoptions.append(str)
    update_index(newoptions)
    #print newoptions
    print "Notebooks converted. Verify and then push the update"

if __name__ == "__main__":
    main()


"""
Helpful links:
http://stackoverflow.com/questions/5607551/python-urlencode-string
https://mkaz.github.io/2014/07/26/python-argparse-cookbook/
http://stackoverflow.com/questions/19067822/save-ipython-notebook-as-script-programmatically to save our notebook as HTML
http://stackoverflow.com/questions/15008758/parsing-boolean-values-with-argparse
http://stackoverflow.com/questions/89228/calling-an-external-command-in-python
http://stackoverflow.com/questions/4710067/deleting-a-specific-line-in-a-file-python
"""
