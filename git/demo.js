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


