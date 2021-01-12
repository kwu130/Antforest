//检查是否开启无障碍服务，若未开启则等待开启
auto.waitFor();

//测试机分辨率为1080*2340
//不同像分辨率的机型会按比例缩放
setScreenMetrics(1080, 2340);   //不要修改该行代码

//读取配置文件，设置相应参数
var config = require("./Modules/MODULE_CONFIGURE");
const { force_retry } = require("./Modules/MODULE_CONFIGURE");
var g_startTime   = config.startTime;
var g_endTime     = config.endTime;
var g_password    = config.password;
var g_passmode    = config.passmode;
var g_is_cycle    = config.is_cycle;
var g_help_friend = config.help_friend;
var g_low_power   = config.low_power;
var g_force_retry = config.force_retry;

//六球坐标值
var g_energy_postion = [[250, 750], [350, 700], [450, 650], [600, 650], [750, 700], [850, 750]];

//搜索控件时使用的常量
const PREFIX = "prefix";
const SUFFIX = "suffix";
const TEXT   = "text";
const DESC   = "desc";

//记录屏幕亮度调节模式和亮度
var mode = -1, light = 255;

//debug标志 用于测试
const DEBUG = true;

//主程序入口
main();

/**
 * 请求截图权限
 */
function getScreenCapturePermission()
{//建议永久开启截图权限，在"取消"按键的上方，部分设备看不见，但是是存在的可以点击
    if (!requestScreenCapture())
    {
        logger("获取截图权限失败，脚本退出", 9);
        exit();
    }
    logger("获取截图权限成功，等待支付宝启动", 3);
    sleep(1000);
}
/**
 * 注册退出事件
 */
function registerExitEvent()
{
    var thread = threads.start(function(){
        events.observeKey();
        events.onKeyDown("volume_down", function(event){
            logger("音量下键被按下，脚本退出", 5);
            //恢复亮度
            if (mode != -1)
            {
                device.setBrightnessMode(mode);
                device.setBrightness(light);
            }
            exit();
        });
    });
    return thread;
}
/**
 * 寻找支付宝首页
 */
function findHomePage()
{
    let i = 0;
    //尝试5次找到支付宝首页
    while (i++ < 5)
    {
        if (text("首页").exists() && text("我的").exists()) break;
        back();
        sleep(500);
    }
    if(i < 5)
        return true;
    else
        return false;
}
/**
 * 打开支付宝
 */
function openAlipay()
{//请确保打开了"Auto.js"的后台弹出界面权限
    launchApp("支付宝");
    sleep(3000);
    //寻找支付宝首页
    if (!findHomePage())
    {//未找到，退出脚本
        if (g_force_retry) {
            tryAgain("寻找支付宝首页失败", 1000);
        } else {
            logger("寻找支付宝首页失败，脚本退出", 9);
            exit();
        }
    }
    else
    {//找到则点击
        let item = text("首页").findOnce();
        if (!item.selected())
        {
            let pos = item.bounds();
            if(!click(pos.centerX(), pos.centerY()))
            {
                if (g_force_retry) {
                    tryAgain("打开支付宝首页失败", 1000);
                } else {
                    logger("打开支付宝首页失败，脚本退出", 9);
                    exit();
                }
            }
        }
        console.log("成功找到支付宝首页");
    }
}
/**
 * 进入蚂蚁森林
 */
function entranceAntForest()
{
    //滑动页面找到蚂蚁森林
    var item = null, i = 0;
    while (i++ < 5)
    {
        // 使用className和text双重定位
        item = className("android.widget.TextView").text("蚂蚁森林").findOnce(); 
        if (item != null) break;
        swipe(520, 500, 520, 1500, 500);
        sleep(200);
    }
    if (item == null)
    {
        if (g_force_retry) {
            tryAgain("首页上没有蚂蚁森林", 1000);
        } else {
            logger("首页上没有蚂蚁森林，退出脚本", 9);
            exit();
        }
    }
    else
    {
        let pos = item.bounds();
        click(pos.centerX(), pos.centerY());
    }
    //确保进入蚂蚁森林主页
    i = 0;
    while (i++ < 10)
    {
        //if (text("背包").exists() && text("任务").exists()) break;
        if (text("种树").findOnce() || text("最新动态").findOnce()) break;
        sleep(1000);    //进入蚂蚁森林主页的时间较长，因此循环检测的时间间隔设置为1000ms(default 500ms)
    }
    if (i >= 10) 
    {
        if (g_force_retry) {
            tryAgain("进入蚂蚁森林主页失败", 1000);
        } else {
            logger("进入蚂蚁森林主页失败，退出脚本", 9);
            exit();
        }
    }
    else
    {
        if (DEBUG)
            console.log("成功进入蚂蚁森林主页", "用时" + i*1.0 + "秒");
        else
            console.log("成功进入蚂蚁森林主页");
    }
    //收集自己的能量
    collectionEnergyByPosition(100);    //100ms delay

    //确保"查看更多好友"控件出现在屏幕中
    item = null;
    i = 0;
    while (i++ < 10)
    {
        item = text("查看更多好友").findOnce();
        if(item != null && item.bounds().height() > 55) break;
        swipe(520, 1800, 520, 300, 500);
        sleep(200);
    }
    if (item == null)
    {
        if (g_force_retry) {
            tryAgain("没有找到查看更多好友", 1000);
        } else {
            logger("没有找到查看更多好友，退出脚本", 9);
            exit();
        }
    }
    else
    {
        let pos = item.bounds();
        if (!click(pos.centerX(), pos.centerY()))
        {
            if (g_force_retry) {
                tryAgain("进入好友排行榜失败", 1000);
            } else {
                logger("进入好友排行榜失败，退出脚本", 9);
                exit();
            }
        }
        else
        {
            //进入好友排行榜
            if (DEBUG)
                console.log("成功进入好友排行榜", "用时" + i*0.5 + "秒");
            else
                console.log("成功进入好友排行榜");
            //预留足够的反应时间(default 2000ms)等待进入排行榜页面
            //否则会出现排行榜前几个好友检测不到的bug
            sleep(2000);
            
            //进入好友排行榜页面收集好友能量
            entranceFriendsRank();
        }
    }
}
/**
 * 日志打印
 * @param {*} msg 日志信息
 * @param {*} level 打印级别 4bit表示
 * 前3bit表示console的级别：001->info 010->warn 100->error
 * 最后1bit表示是否打印toast：0->不打印 1->打印
 */
function logger(msg, level) {
    if (typeof(level) == "undefined") level = 0; // 默认不打印
    if (level > 15) return;
    if (level & 1) toast(msg);
    if (level & 2) console.info(msg);
    if (level & 4) console.warn(msg);
    if (level & 8) console.error(msg);
}

/**
 * 根据名称查找并点击控件 返回null表示查找失败 返回false表示点击失败 返回true表示成功
 * @param {*} click_name 控件名称
 * @param {*} match_pos 前缀、后缀还是完全匹配
 * @param {*} text_or_desc text还是desc属性
 * @param {*} timeout 查找的超时时间
 */
function searchAndClickByName(serach_name, match_pos, text_or_desc, timeout)
{
    var result = null;
    if (match_pos == "prefix")
    {
        if (text_or_desc == "text")
            result = textStartsWith(serach_name).findOne(timeout);
        else
            result = descStartsWith(serach_name).findOne(timeout);
    }
    else
    {
        if (text_or_desc == "text")
            result = textEndsWith(serach_name).findOne(timeout);
        else
            result = descEndsWith(serach_name).findOne(timeout);
    }
    if(!result)
    {
        let pos = result.bounds();
        if(pos.centerX() < 0 || pos.centerY() < 0)
            return false;
        else
            return click(pos.centerX(), pos.centerY());
    }
    return null;
}
/**
 * 通过六球坐标收取(帮收)能量
 * @param {*} delay 
 */
function collectionEnergyByPosition(delay)
{
    if (typeof(delay) == "undefined") delay = 0;
    for (let i = 0; i < g_energy_postion.length; ++i)
    {
        sleep(delay);
        click(g_energy_postion[i][0], g_energy_postion[i][1]);
    }
}
/**
 * 获取截图
 */
function getCaptureImg()
{
    var img = captureScreen();
    sleep(100);
    if (img == null || typeof(img) == "undefined")
    {
        logger("截图失败，脚本退出", 9);
        exit();
    }
    else
    {
        return img;
    }
}
/**
 * 获取有能量成熟的好友
 */
function getHasEnergyFriends()
{
    var img = getCaptureImg();
    var hand = null, heart = null;

    //查找可收取能量的小手 "#39876D"为深绿色 "#FFFFFF"为白色
    hand = images.findMultiColors(img, "#39876D", [[0, -10, "#FFFFFF"], [0, 10, "#FFFFFF"]], {
        region: [1010, 400 , 1, 1800], threshold: 15});
    if (hand != null)
    {
        console.info("找到**可收取**好友");
        return [hand, "hand"];
    }

    if (g_help_friend == true)
    {
        //查找可帮收能量的爱心 "#F99236"为橙色
        heart = images.findColor(img, "#F99236", {region: [1000, 400 , 10, 1800], threshold: 4});
        if (heart != null)
        {
            console.info("找到**可帮收**好友");
            return [heart, "heart"];
        }
    }
    return null;
}
/**
 * 检测是否到达排行榜底部
 */
function arriveRankBottom()
{
    var img = getCaptureImg();
    //分别是白色、浅灰色、深灰色
    var result = null;
    result = images.findMultiColors(img, "#F5F5F5", [[0, -40, "#FFFFFF"], [0, 20, "#999999"]], {
        region : [600, 2000], threshold : 1});
    if (result != null)
        return true;
    else
        return false;
}
/**
 * 进入好友排行榜
 */
function entranceFriendsRank()
{
    var i = 0;
    sleep(500);
    var epoint = getHasEnergyFriends();

    //确保当前操作是在排行榜界面
    //不断滑动，查找好友
    while (epoint == null)
    {
        swipe(520, 1800, 520, 800, 500);
        sleep(200);
        epoint = getHasEnergyFriends();
        //如果检测到结尾，同时也没有可收能量的好友，那么结束收取
        if (epoint == null && arriveRankBottom())
        {
            logger("没有更多好友了", 3);
            return true;
        }
        //如果连续32次都未检测到可收集好友,无论如何停止查找
        if(i++ >= 32)
        {
            console.error("程序可能出错, 连续" + i + "次未检测到可收集好友");
            return false;
        }
    }
    //找到好友，进入好友森林
    if (click(epoint[0].x, epoint[0].y + 20))
    {
        //确认进入了好友森林
        let i = 0;
        while (i++ < 10)
        {
            //if (text("看林区").exists() || text("浇水").exists()) break;
            if (text("我的大树养成记录").exists() || text("你收取TA").exists()) break;
            sleep(500);
        } 
        if (i < 10)
        {
            if (DEBUG) console.log("成功进入好友森林主页", "用时" + i*0.5 + "秒");
            collectionEnergyByPosition(100);    //100ms delay
        }
        //返回排行榜
        back();
    }
    //递归调用
    entranceFriendsRank();
}
/**
 * 一次运行结束
 */
function runDoneOnce(cnt)
{
    console.info("第 " + cnt + " 遍收集结束");
    back();
}
/**
 * 异常退出当前脚本前再启动一个脚本进行重试
 * @param {*} delay 退出前的时延
 */
function tryAgain(errmsg, delay)
{
    //重试前先恢复亮度
    if(mode != -1)
    {
        device.setBrightnessMode(mode);
        device.setBrightness(light);
    }
    var now = new Date();
    var hour = now.getHours();
    var minu = now.getMinutes();
    var time_a = g_startTime.split(":");
    var time_b = g_endTime.split(":");
    var timea = 60 * Number(time_a[0]) + Number(time_a[1]);
    var timeb = 60 * Number(time_b[0]) + Number(time_b[1]);
    var time  = 60 * hour + minu;
    if(time >= timea && time <= timeb) {
        logger(errmsg + ", 当前时间仍在监控范围内, 即将重试", 9);
    }
    else{
        logger(errmsg + ", 当前时间不在监控范围内, 退出脚本", 9);
        exit();
    }
        
    if(typeof(delay) == "undefined") delay = 1000; //default 1000ms
    let path = engines.myEngine().cwd();
    let name = "ant_forest.js";

    engines.execScriptFile(path + "/" + name);
    sleep(delay);
    exit();
}
/**
 * 检查是否仍在给定时间范围内
 */
function checkTimeIsvalid()
{
    var now = new Date();
    var hour = now.getHours();
    var minu = now.getMinutes();
    var time_a = g_startTime.split(":");
    var time_b = g_endTime.split(":");
    var timea = 60 * Number(time_a[0]) + Number(time_a[1]);
    var timeb = 60 * Number(time_b[0]) + Number(time_b[1]);
    var time  = 60 * hour + minu;
    if(time >= timea && time <= timeb)
    {
        console.log("当前时间仍在监控范围内");
        return true;
    }
    else
    {
        console.log("当前时间不在监控范围内");
        return false;
    }
}
/**
 * 输出脚本执行配置信息
 */
function printConfigureInfo()
{
    console.log("*********************************");
    if (g_is_cycle)
    {
        console.info("循环执行开始时间：" + g_startTime);
        console.info("循环执行结束时间：" + g_endTime);
    }
    let yes_or_no = g_help_friend ? "是":"否";
    console.info("是否帮助好友收取：" + yes_or_no);
    yes_or_no = g_low_power ? "是":"否";
    console.info("循环期间是否省电：" + yes_or_no);
    console.info("手机屏幕解锁方式：", g_passmode == "pin" ? "数字解锁" : "图案解锁");
    console.log("*********************************");
}
/**
 * 主函数
 */
function main()
{
    var unlock = require("./Modules/MODULE_UNLOCK");
    //解锁设备
    if (!unlock.unlock(g_password, g_passmode))
    {
        sleep(60 * 1000) // 等待60s后再次尝试
        if (checkTimeIsvalid()) 
        {
            tryAgain("解锁失败", 1000); // 若仍在运行时间内 进行重试
        }
    }
    sleep(1000);
    //获取截图权限
    getScreenCapturePermission();
    //注册"音量下键按下退出脚本"事件
    var exit_event = registerExitEvent();
    //等待退出事件子线程执行
    exit_event.waitFor();
    //输出配置信息
    printConfigureInfo();
    //检查是否开启省电运行
    if (g_is_cycle && g_low_power && checkTimeIsvalid())
    {
        //记录原始亮度模式和值
        mode  = device.getBrightnessMode();
        light = device.getBrightness();
        if(mode == 1)
        {
            device.setBrightnessMode(0);//设置为手动模式
        }
        device.setBrightness(10);//设置亮度为10
    }
    var cnt = 1;//记录遍历次数
    do
    {
        //打开支付宝
        openAlipay();
        //进入蚂蚁森林
        entranceAntForest();
        //一次收集结束
        runDoneOnce(cnt++);
    }while (g_is_cycle && checkTimeIsvalid())
    //恢复亮度
    if (mode != -1)
    {
        device.setBrightnessMode(mode);
        device.setBrightness(light);
    }
    //退出脚本
    logger("运行结束，退出脚本", 3);
    exit();
}
