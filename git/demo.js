// git只能跟踪文本文件的变化
// git diff <文件名>  - 可以看见哪里变化了
// git log 命令查看历史记录,git log命令显示从最近到最远的提交日志，我们可以看到3次提交,如果嫌输出信息太多，看得眼花缭乱的，可以试试加上--pretty=oneline参数：
// git log --pretty=oneline
// ! 回到过去
// git reset --hard HEAD^ 回退上个版本
// git reset --hard HEAD^^ 上上个版本
// git reset --hard HEAD~100 上100个版本
// ! 回到过去某个版本 
// git log --pretty=oneline 查看commit id
// git reset --hard <commit id>
// ! 回到将来（得找到将来版本的commit id）
// git reflog 用来记录你的每一次命令