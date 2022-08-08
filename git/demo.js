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
// ! 10 多人协作
/**
 * 

    查看远程库信息，使用git remote -v；

    本地新建的分支如果不推送到远程，对其他人就是不可见的；

    从本地推送分支，使用git push origin branch-name，如果推送失败，先用git pull抓取远程的新提交；

    在本地创建和远程分支对应的分支，使用git checkout -b branch-name origin/branch-name，本地和远程分支的名称最好一致；

    建立本地分支和远程分支的关联，使用git branch --set-upstream branch-name origin/branch-name；

    从远程抓取分支，使用git pull，如果有冲突，要先处理冲突。

 */
// ! 11 rebase 变基 —— 如果提交存在于你的仓库之外，而别人可能基于这些提交进行开发，那么不要执行变基。
// 变基使得提交历史更加整洁。 
// 你在查看一个经过变基的分支的历史记录时会发现，尽管实际的开发工作是并行的， 但它们看上去就像是串行的一样，提交历史是一条直线没有分叉。
/**
 * 一般我们这样做的目的是为了确保在向远程分支推送时能保持提交历史的整洁——例如向某个其他人维护的项目贡献代码时。
 * 在这种情况下，你首先在自己的分支里进行开发，当开发完成时你需要先将你的代码变基到 origin/master 上，然后再向主项目提交修改。 
 * 这样的话，该项目的维护者就不再需要进行整合工作，只需要快进合并便可。
 * 
 * 请注意，无论是通过变基，还是通过三方合并，整合的最终结果所指向的快照始终是一样的，只不过提交历史不同罢了。 
 * 变基是将一系列提交按照原有次序依次应用到另一分支上，而合并是把最终结果合在一起。
 */
// $ git checkout experiment
// $ git rebase master
// $ git checkout master
// $ git merge experiment

/**
 * 

接下来你决定将 server 分支中的修改也整合进来。 使用 git rebase <basebranch> <topicbranch> 命令可以直接将主题分支 （即本例中的 server）变基到目标分支（即 master）上。 这样做能省去你先切换到 server 分支，再对其执行变基命令的多个步骤。

$ git rebase master server


 */
// ! 12 标签
// 默认标签是打在最新提交的commit上的 
// git tag v1.0
// git tag 查看所有标签
// git tag v0.9 f52c633 针对固定commit id 打标签
// 标签不是按时间顺序列出，而是按字母排序的。可以用git show <tagname>查看标签信息
// git tag -a v0.1 -m "version 0.1 released" 1094adb  创建带有说明的标签，用-a指定标签名，-m指定说明文字
// git tag -d v0.9 删除标签 因为创建的标签都只存储在本地，不会自动推送到远程。所以，打错的标签可以在本地安全删除。
// 如果要推送某个标签到远程，使用命令git push origin <tagname>
// git push origin v1.0
// 或者，一次性推送全部尚未推送到远程的本地标签：$ git push origin --tags

// 如果标签已经推送到远程，要删除远程标签就麻烦一点，先从本地删除：
// $ git tag -d v0.9
// 然后，从远程删除。删除命令也是push，但是格式如下：
// $ git push origin :refs/tags/v0.9 （ git push origin :refs/tags/<tagname> ）



