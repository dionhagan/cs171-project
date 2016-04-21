# CS171 Team Project
Final team project for CS171 Spring 2016

## Team Braavos

Dion Hagan

Marina Adario

Malcolm Mason Rodriguez

David Wihl

## Where to Find Things:

[Trello Board for this project](https://trello.com/b/zguJ72GM)

[Slack Channel](https://braavos171.slack.com/messages/general/)

[Project Proposal](deliverables/proposal.md) (submitted 3/21/16)

[Current Public Site](http://www.chanceme.info/) (that we will rip and replace)

[Short Slide Deck](https://docs.google.com/presentation/d/1-M2xu4Usn6qCjNl93VRYZrHv3u72vqYo7gsnn-YyYDA/edit?usp=sharing) that gives an overview.

Way too long [business plan (incl. personas)](https://docs.google.com/document/d/1mQBaiMpOU0Eh4kdLWQTzs3X2g4Pm-BecExju6vv58gU/edit?usp=sharing)

Prior [CS109 github site](https://github.com/wihl/cs109-groupproj-college) and [Project Description](http://project.chanceme.info)

[Heroku Dashboard](https://dashboard.heroku.com/apps/boiling-forest-8250/resources) (where the current Python-based backend lives). Ask David for access - you'll need a Heroku account.

## Directory Structure

* `client` all the client-side / D3 / Visualization code
* `deliverables` team homework location
* `experiments` new code to try, explorations, risky attempts
* `sketches` sketches, ideas, typically hand-drawn
* `processbook` the process book for the project
* `webservice` the Python based webservice (from CS109)


## git Notes

Since we will be working concurrently on multiple parts of this
project, `git` will be very useful tool to ensure that we can
work in parallel, even on the same code, without interference.

Here are some notes to get you started.

### Copy this repository to your machine

`git clone git@github.com:wihl/cs171-project.git

### Creating a branch

This will create a new branch in the code. You can do anything you
want in this branch and it will not affect anything in master,
until a merge is done (see below).

```
cd cs171-project
git checkout -b newbranch
git push origin newbranch
git push --set-upstream origin newbranch
```
The `push origin` is needed to send the branch to github, which you
will need to do before pushing the branch so everyone else can see
it.

From this point do whatever edits you want. Create a subdirectory,
add files, make changes.

### Commit early and regularly

Do not leave your code unbackedup on your machine. I commit every
time I add something new and useful that works. It could be as little
as 2-3 lines of code.

This is the same as in class, although now you will be committing just
to your branch.

Assuming you are in the cs171-project directory

```
git add .
git commit -m "<one line summary of what changed>"
git push
```

### See what others have done

To grab a fresh local copy of everything in the github repository, use
`git fetch`. Any new branches anyone else has created will be moved
down.

To switch to their branch, while leaving yours untouched use
`git checkout otherbranch`. To get back to your branch `git checkout mybranch`.

### Merging - Step 1

The first step in merging is to merge the latest master branch into
your branch

```
git fetch
git merge origin/master
```
If there are any conflicts, like two people having written to the same
file in the same place, it will let you know. It is pretty smart
about merging different pieces of code or file that do not impact each
other. This is one of git's most amazing features.

After you have reconciled any merge conflicts, you can commit
the merged master into your branch, which are the same commands as
before

```
git add .  
git commit -m "I merged in master"  
git push  
```
Now your branch has all of master and all of your new stuff

### Merging - Step 2

Now that you are fully up to date in your branch, you can update master:

```
git checkout master  
git merge newbranch    
git status    
git push  
```
Now your code has been integrated into master. Your work is done.

Create a new branch to start on another unit of work (or keep
working on the same branch if it isn't done yet).

It is a good idea to not wait too long to merge into master. Once it is
in a stable state, ready to use by others if not feature complete, do
the merge into master.

### That's It

`git` has many powerful features like pull requests and code reviews,
but I don't think we need them for this project.

## Using GitHub Pages

The [gh-pages](https://help.github.com/articles/creating-project-pages-manually/) branch is where the public facing information
lives. Per the github docs, this branch is an orphan. You
might as well consider it being two repositories in one.

Since it is effectively two repositories, I keep two
copies of the repository on my local hard drive:

Primary copy:
```
cd <wherever you put projects>
git clone git@github.com:wihl/cs171-project.git
```
This creates a `cs171-project` directory in your current location.

Then I make secondary copy in a parallel directory **not under cs171-project**.

So while still in the current directory, not in the cs171-project directory:
```
mkdir projectwebsite
cd projectwebsite
git clone git@github.com:wihl/cs171-project.git
cd cs171-project
git checkout gh-pages
```

So now I have
```
./cs171-project
./projectwebsite/cs171-project # gh-pages branch
```


### Contents of `gh-pages`

There are two subdirectories: `./client` and `./processbook`

We also use a CNAME to have a well defined public facing URL (vis.chanceme.info) instead of the default `wihl.github.io/cs171-project`.

When the user navigates to [vis.chanceme.info](http://vis.chanceme.info), a small `index.html` file redirects them to the client code.

If the user explicitly navigates to [vis.chanceme.info/processbook](http://vis.chanceme.info/processbook), they skip over the small `index.html` and land on the process book.

### How to Release a New Public Version

Given the file structure above, releasing a new public version
of the client consists of copying the client code from the master
repository into the repository having the gh-pages branch.

```
cd <wherever you put projects>
cd cs171-project
cp -r client ../projectwebsite/cs171-project/
cd ../projectwebsite/cs171-project
```

Now the files are staged. Check them on your local machine with a webserver, such as:

```
python -m SimpleHTTPServer 8888 &
open http://localhost:8888
```

If you are happy with results, publish it to the public:

```
git add .
git commit -m "awesome new features"
git push
```

About a minute after the push is done, it will be live.

### Updating the Process Book(s)

The process books are stored in iPython/Jupyter notebooks.

```
cd <wherever you put projects>/cs171-project/processbook
jupyter notebook
```

and then open the notebook you want to modify.

When you are done, and are ready to publish a new version of the
process book, there is a convenient script in the processbook directory called `publish.py`

This script converts the Jupyter notebooks to HTML, stitches them together, copies the results to the project website and updates the processbook
index page.

Once it has done it's thing, check it and then publish it publicly.

```
python publish.py
cd ../../projectwebsite/cs171-project
python -m SimpleHTTPServer 8888 &
open http://localhost:8888/processbook
```

If it all looks good, then publish it to the public:
```
git add .
git commit -m "updates to processbook"
git push
```

And then check it: [vis.chanceme.info/processbook](http:/vis.chanceme.info/processbook)
