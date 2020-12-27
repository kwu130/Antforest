# Alipay
蚂蚁森林自动收取能量脚本(包括收取好友能量)

需要安卓7.0以上机型，在Auto.js下运行，脚本运行需要开启Auto.js的无障碍服务

项目中附带的安装包为Auto.js 4.1.1版本
# 使用说明
1. 安装AutoJs
- 下载**AutolsAPK**文件夹中的app并安装。
2. 导入脚本
- 默认情况下，安装好**autojs**后，会自动在手机中生成一个名为**脚本**的文件夹，若未生成，则自行创建该文件夹。
- 将**AntForest**文件夹复制进上一步的**脚本**文件夹中。
3. 运行脚本
- 打开安装好的**autojs**。
- 点击左上角的菜单栏，打开 **无障碍服务**。
- 进入**AntForest**文件夹，点击运行*configure*文件，进行初次参数配置。
- 参数配置好之后，点击运行*ant_forest*文件，开启蚂蚁森林能量收取脚本。
- 注：永久开启截图权限：首次运行时，会请求系统截图权限，建议选择永久开启。
---
# 现有功能介绍
- 收取自己能量
- 收取好友能量
- 设置收取时间
- 参数配置界面
- 帮好友收能量
- 自动解锁运行
- 出错强制重试
---
# 更新说明
- 2020/1/2 
    - 修复在配置界面点击"清除配置"按钮后，配置界面未更新的问题

- 2020/1/3
    - 增加循环执行期间选择是否降低屏幕亮度进行省电收集能量（需开启Autojs"修改系统设置"的权限）

- 2020/1/7
    - 修复偶尔出现提示"解锁失败，退出脚本"，从而导致脚本异常退出的错误

- 2020/1/8
    - 修复偶尔出现点击"查看更多好友"失败，错误的进入了其他页面的问题

- 2020/1/9
    - 修复偶尔出现收集能量有遗漏的问题

- 2020/1/10
    - 优化查找支付宝首页的相关函数

- 2020/1/12
    - 优化脚本执行性能

- 2020/1/14
    - 增加脚本异常退出时进行重试的功能

- 2020/1/19
    - 优化解锁函数
    
- 2020/1/20
    - 修复unlock函数的bug

- 2020/1/24
    - 修复因春节活动导致的进入蚂蚁森林主页失败的问题

- 2020/2/26
    - 修复红米系列手机解锁失败的问题

- 2020/4/2
    - 增加解锁失败后重试的功能
    - 优化帮好友收取能量的函数

- 2020/4/30
    - 修复首页搜索框出现"蚂蚁森林"时导致错误点击的问题

- 2020/5/3
    - 修复不能识别成功进入好友主页的问题
    - 修复不能识别成熟能量球的问题

- 2020/5/27
    - 修复识别有能量收取的"小手"和有能量帮收的"爱心"失败的问题
    - 优化收取能量的速度
    - 去除统计能量收取总量的功能（蚂蚁森林已主动支持）
    - 优化代码质量

- 2020/5/30
    - 增加图案解锁

- 2020/5/31
    - 修复不能识别"成功进入好友森林主页"

- 2020/6/1
    - 修复偶尔解锁失败的问题

- 2020/9/17
    - 增加循环期间强制重试功能
    - 优化页面等待滑动时长
    - 统一日志打印函数

- 2020/11/3
    - 修复因蚂蚁森林更新导致的不能正确识别进入森林主页的问题

- 2020/11/16
    - 修复收取自己能量失败的问题

- 2020/12/27
    - 修复遗漏能量球的问题
    - 优化省电收取能量