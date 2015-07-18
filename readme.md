##Simple Web Chat##

####usage####
初始界面：在username输入框中输入昵称，按回车键确认并进入聊天界面。

聊天界面：在下方输入框输入消息，按回车键发送。

####features####

在初始界面检查昵称是否与聊天室中在线成员重复。

聊天界面显示在线成员。

当其他用户进入聊天室或断开连接时显示join the room, left the room。

用户网络连接断开时，界面跳回初始界面，其他用户可看到left the room。

####代码说明####

由 Firebase 官网 Example Chat 改编。

使用promise与事件回调等实现异步（初始界面按回车时显示进度条，并解除输入框事件监听等）

**文件结构：**

index.htm：主页面

main.js：处理主页面的js文件

main.css：主页面CSS
