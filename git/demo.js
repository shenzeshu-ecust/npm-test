// ~ 工作区 - 暂存区（Stage）- 分支
// ~ 文件修改在 工作区 git add后进入 暂存区
// ? git只能跟踪文本文件的变化
// git diff <文件名>  - 可以看见哪里变化了
// git log 命令查看历史记录,git log命令显示从最近到最远的提交日志，我们可以看到3次提交,如果嫌输出信息太多，看得眼花缭乱的，可以试试加上--pretty=oneline参数：
// git log --pretty=oneline
// ! 1 回到过去
// git reset --hard HEAD^ 回退上个版本
// git reset --hard HEAD^^ 上上个版本
// git reset --hard HEAD~100 上100个版本
// ! 回到过去某个版本 
// git log --pretty=oneline 查看commit id
// git reset --hard <commit id>
// ! 2 回到将来（得找到将来版本的commit id）
// git reflog 用来记录你的每一次命令 找到commit id
// git reset --hard <commit id>
// ! 3 撤销”工作区“的修改（还没git add）让这个文件回到最近一次git commit或git add时的状态。
// git checkout -- file
// ------new version------
// git restore file
// ! 如果已经git add 了，想要回退： git reset
// git reset命令既可以回退版本，也可以把暂存区的修改回退到工作区。当我们用HEAD时，表示最新的版本。
// 1 git reset HEAD <file>
// 2 git checkout -- <file>
// ------new version------
// 1 先撤销暂存区的修改，用 git restore --staged file
// 2 然后撤销工作区的修改: git restore file
// ! 如果已经git commit了，参考1.(前提没git push orgin)
// git reset --hard HEAD^
// ! 4 删除文件
// git rm <file> :git rm就是删文件，并且把删文件的修改提交到暂存区.相当于rm删文件后，git add 提交，保存修改
// ! 5 添加远程origin
// git remote -v显示更详细的信息
// git remote add origin git@github.com:michaelliao/learngit.git
// git push -u origin master  把本地库的所有内容推送到远程库上（首次推送）由于远程库是空的，我们第一次推送master分支时，加上了-u参数，Git不但会把本地的master分支内容推送的远程新的master分支，
// 还会把本地的master分支和远程的master分支关联起来，在以后的推送或者拉取时就可以简化命令。
// ! 6 删除远程origin
// git remote -v 建议先用git remote -v查看远程库信息
// 然后，根据名字删除，比如删除origin
// git remote rm origin
// 此处的“删除”其实是解除了本地和远程的绑定关系，并不是物理上删除了远程库。
// ! 7 分支 - 分支就是指针（切换分支 --> HEAD指向变一下）
// 查看分支：git branch

// 创建分支：git branch <name>

// 切换分支：git checkout <name>或者 git switch <name>

// 创建+切换分支：git checkout -b <name>或者 git switch -c <name>

// 合并某分支到当前分支：git merge <name>

// 删除分支：git branch -d <name>
// 强行删除分支（某个分支没被合并） git branch -D <name>
// ! 查看分支的合并图
// git log --graph --pretty=oneline --abbrev-commit
// ! --no-ff 表示禁用Fast forward
// 通常，合并分支时，如果可能，Git会用Fast forward模式，但这种模式下，删除分支后，会丢掉分支信息。
// 如果要强制禁用Fast forward模式，Git就会在merge时生成一个新的commit，这样，从分支历史上就可以看出分支信息
// git merge --no-ff -m "merge with no-ff" dev (本次合并要创建一个新的commit，所以加上-m参数，把commit描述写进去。)
// git log 查看可以得到：不适用fast forward模式，可以看出来曾经做过合并，而fast forward合并就看不出来曾经做过合并。
// ! 8 git stash 可以把当前工作现场“储藏”起来，等以后恢复现场后继续工作
// 现在，用git status查看工作区，就是干净的（除非有没有被Git管理的文件），因此可以放心地创建分支来修复bug。

// git stash list 工作现场还在，Git把stash内容存在某个地方了
// ? 但是需要恢复一下，有两个办法：
// 一是用git stash apply恢复，但是恢复后，stash内容并不删除，你需要用git stash drop来删除；
// 另一种方式是用git stash pop，恢复的同时把stash内容也删了

// 你可以多次stash，恢复的时候，先用git stash list查看，然后恢复指定的stash，用命令：
// git stash apply stash@{0}
// ! 9 git cherry-pick <commit id>
/*
    --> 在master分支上修复的bug，想要合并到当前dev分支
    同样的bug，要在dev上修复，我们只需要把4c805e2 fix bug 101这个提交所做的修改“复制”到dev分支。注意：我们只想复制4c805e2 fix bug 101这个提交所做的修改，并不是把整个master分支merge过来。
    为了方便操作，Git专门提供了一个cherry-pick命令，让我们能复制一个特定的提交到当前分支
    git cherry-pick 4c805e2
*/

