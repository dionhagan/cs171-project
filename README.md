# CS171 Team Project
Final team project for CS171 Spring 2016

Team Braavos

### Team:

Dion Hagan

Marina Adario

Malcolm Mason Rodriguez

David Wihl

# Where to Find Things:

[Trello Board for this project](https://trello.com/b/zguJ72GM)

[Slack Channel](https://braavos171.slack.com/messages/general/)

[Project Proposal](proposal.md) (submitted 3/21/16)

[Current Public Site](http://www.chanceme.info/) (that we will rip and replace)

[Short Slide Deck](https://docs.google.com/presentation/d/1-M2xu4Usn6qCjNl93VRYZrHv3u72vqYo7gsnn-YyYDA/edit?usp=sharing) that gives an overview.

Way too long [business plan (incl. personas)](https://docs.google.com/document/d/1mQBaiMpOU0Eh4kdLWQTzs3X2g4Pm-BecExju6vv58gU/edit?usp=sharing)

Prior [CS109 github site](https://github.com/wihl/cs109-groupproj-college) and [Project Description](http://project.chanceme.info)

[Responsive Design Prototype](https://github.com/wihl/chanceme-site/tree/gh-pages)

[Heroku Dashboard](https://dashboard.heroku.com/apps/boiling-forest-8250/resources) (where the current Python-based backend lives). Ask David for access - you'll need a Heroku account.

# git Notes

Since we will be working concurrently on multiple parts of this
project, `git` will be very useful tool to ensure that we can
work in parallel, even on the same code, without interference.

Here are some notes to get you started.

#### Copy this repository to your machine

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
