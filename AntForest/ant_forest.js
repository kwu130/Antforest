//检查是否开启无障碍服务，若未开启则等待开启
auto.waitFor();

//测试机像素为1080*2340
//不要修改该行代码
setScreenMetrics(1080, 2340);
//不同像素的机型会对应缩放

//读取配置文件，设置相应参数
var config = require("./Modules/MODULE_CONFIGURE");
var g_startTime   = config.startTime;
var g_endTime     = config.endTime;
var g_password    = config.password;
var g_is_cycle    = config.is_cycle;
var g_help_friend = config.help_friend;
var g_low_power   = config.low_power;
//搜索控件时使用的常量
const PREFIX = "prefix";
const SUFFIX = "suffix";
const COMPLE = "comple";
const TEXT   = "text";
const DESC   = "desc";
//统计能量收集情况
var pre_energy = -1, aft_energy = -1;
//记录屏幕亮度调节模式和亮度
var mode = -1, light = 255;
//debug标志
const DEBUG = true;

//主程序入口
main();

/**
 * 请求截图权限
 */
function get_screencapture_permission()
{//建议永久开启截图权限，在"取消"按键的上方，部分设备看不见，但是是存在的可以点击
    if(!requestScreenCapture())
    {
        toast("获取截图权限失败，脚本退出");
        console.error("获取截图权限失败，脚本退出");
        exit();
    }
    toastLog("获取截图权限成功，等待支付宝启动");
    sleep(1000);
}
/**
 * 注册退出事件
 */
function register_exit_event()
{
    var thread = threads.start(function(){
        events.observeKey();
        events.onKeyDown("volume_down", function(event){
            toast("音量下键被按下，脚本退出");
            console.warn("音量下键被按下，脚本退出");
            exit();
        });
    });
    return thread;
}
/**
 * 找到支付宝首页
 */
function find_homepage()
{
    let i = 0;
    //尝试5次找到支付宝首页
    while(i++ < 5)
    {
        if(text("首页").exists() && text("我的").exists()) break;
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
function open_alipay()
{//请确保打开了"Auto.js"的后台弹出界面权限
    launchApp("支付宝");
    sleep(3000);
    //寻找支付宝首页
    if(!find_homepage())
    {//未找到，退出脚本
        toast("寻找支付宝首页失败，脚本退出");
        console.error("寻找支付宝首页失败，脚本退出");
        exit();
    }
    else
    {//找到则点击
        let item = text("首页").findOnce();
        if(!item.selected())
        {
            let res = click_by_name("首页", SUFFIX, TEXT, 1000);
            if(res == false)
            {
                console.error("打开支付宝首页失败，脚本退出");
                exit();
            }
        }
        console.log("成功找到支付宝首页");
    }
}

/**
 * 记录当前自己的能量总数
 */
function mark_myself_energy()
{
    let total_energy = textEndsWith("g").boundsInside(700, 200, 1080, 400).findOne(1000);
    if(total_energy != null)
    {
        let energy_str = total_energy.text();
        return Number(energy_str.substring(0, energy_str.length-1));
    }
}

/**
 * 进入蚂蚁森林
 */
function entrance_antforest()
{
    //滑动页面找到蚂蚁森林
    let item = null, i = 0;
    while(i++ < 5)
    {
        item = text("蚂蚁森林").findOnce();
        if(item != null && item.bounds().height() > 40) break;
        swipe(520, 500, 520, 1500, 500);
        sleep(500);
    }
    let res1 = click_by_name("蚂蚁森林", COMPLE, TEXT, 1000);
    if(res1 == null)
    {
        toast("首页上没有蚂蚁森林，退出脚本");
        console.error("首页上没有蚂蚁森林，退出脚本");
        exit();
    }
    //确保进入蚂蚁森林主页
    i = 0;
    while(i++ < 10)
    {
        if(text("背包").exists() && text("任务").exists()) break;
        sleep(1000);    //进入蚂蚁森林主页的时间较长，因此循环检测的时间间隔设置为1000ms(default 500ms)
    }
    if(i >= 10) 
    {
        toast("进入蚂蚁森林主页失败，退出脚本");
        console.error("进入蚂蚁森林主页失败，退出脚本");
        //exit();
        try_again(1000);
    }
    else
    {
        if(DEBUG)
            console.log("成功进入蚂蚁森林主页", "用时" + i*1.0 + "秒");
        else
            console.log("成功进入蚂蚁森林主页");
    }
    //记录收集前的能量数
    if(pre_energy == -1)
        pre_energy = mark_myself_energy();
    /*开始能量收集*/
    //收集自己的能量
    if(textEndsWith("克").exists())
    {
        collection_energy(100);
        toast("自己能量收集完成");
        console.info("自己能量收集完成");
    }
    else
    {
        toast("自己没有可收集的能量");
        console.info("自己没有可收集的能量");
    }
    //确保"查看更多好友"控件出现在屏幕中
    item = null;
    i = 0;
    while(i++ < 10)
    {
        item = text("查看更多好友").findOnce();
        if(item != null && item.bounds().height() > 100) break;
        swipe(520, 1800, 520, 300, 500);
        sleep(500);
    }
    //进入好友能量排行榜
    console.log("点击查看更多好友");
    let res2 = click_by_name("查看更多好友", PREFIX, TEXT, 1000);
    if(res2 == null)
    {
        toast("没有找到查看更多好友，退出脚本");
        console.error("没有找到查看更多好友，退出脚本");
        //exit();
        try_again(1000);
    }
    else if(res2 == false)
    {
        toast("进入好友排行榜失败，退出脚本");
        console.error("进入好友排行榜失败, 退出脚本");
        //exit();
        try_again(1000);
    }
    else
    {
        //进入好友排行榜
        if(DEBUG)
            console.log("成功进入好友排行榜", "用时" + i*0.5 + "秒");
        else
            console.log("成功进入好友排行榜");
        //预留足够的反应时间(default 2000ms)等待进入排行榜页面
        //否则会出现排行榜前几个好友检测不到的bug
        //不能通过while(!text("总排行榜").exists())来检测
        //因为前一个页面也有text为"总排行榜"的控件
        sleep(2000);
        
        //进入好友排行榜页面收集好友能量
        entrance_friends();
        //能量收集完成回到页面顶端查看当前能量值
        back();
        sleep(500);
        swipe(520, 300, 520, 1800, 500);
        sleep(500);
        swipe(520, 300, 520, 1800, 500);
        sleep(500);
        swipe(520, 300, 520, 1800, 500);
        aft_energy = mark_myself_energy();
    }
    
}
/**
 * 根据名称点击控件
 * @param {*} click_name 控件名称
 * @param {*} match_pos 前缀、后缀还是完全匹配
 * @param {*} text_or_desc text还是desc属性
 * @param {*} timeout 超时时间
 */
function click_by_name(click_name, match_pos, text_or_desc, timeout)
{
    if(match_pos == "prefix" && text_or_desc == "text")
    {
        var result = textStartsWith(click_name).findOne(timeout);
        if(result != null)
        {
            let pos = result.bounds();
            if(pos.centerX() < 0 || pos.centerY() < 0)
                return false;
            else
                return click(pos.centerX(), pos.centerY());
        }
        else
            return null;
    }
    if(match_pos == "prefix" && text_or_desc == "desc")
    {
        var result = descStartsWith(click_name).findOne(timeout);
        if(result != null)
        {
            let pos = result.bounds();
            if(pos.centerX() < 0 || pos.centerY() < 0)
                return false;
            else
                return click(pos.centerX(), pos.centerY());
        }
        else
            return null;
    }
    if(match_pos == "suffix" && text_or_desc == "text")
    {
        var result = textEndsWith(click_name).findOne(timeout);
        if(result != null)
        {
            let pos = result.bounds();
            if(pos.centerX() < 0 || pos.centerY() < 0)
                return false;
            else
                return click(pos.centerX(), pos.centerY());
        }
        else
            return null;
    }
    if(match_pos == "suffix" && text_or_desc == "desc")
    {
        var result = descEndsWith(click_name).findOne(timeout);
        if(result != null)
        {
            let pos = result.bounds();
            if(pos.centerX() < 0 || pos.centerY() < 0)
                return false;
            else
                return click(pos.centerX(), pos.centerY());
        }
        else
            return null;
    }
    if(match_pos == "comple" && text_or_desc == "text")
    {
        var result = text(click_name).findOne(timeout);
        if(result != null)
        {
            let pos = result.bounds();
            if(pos.centerX() < 0 || pos.centerY() < 0)
                return false;
            else
                return click(pos.centerX(), pos.centerY());
        }
        else
            return null;
    }
    if(match_pos == "comple" && text_or_desc == "desc")
    {
        var result = desc(click_name).findOne(timeout);
        if(result != null)
        {
            let pos = result.bounds();
            if(pos.centerX() < 0 || pos.centerY() < 0)
                return false;
            else
                return click(pos.centerX(), pos.centerY());
        }
        else
            return null;
    }
}

/**
 * 收集自己和好友的能量
 * @param {*} delay 点击能量球的时间间隔
 */
function collection_energy(delay)
{//delay为500ms时，可直观观察到能量收集情况
    if(typeof(delay) == "undefined") delay = 500;
	if(textEndsWith("克").exists())
	{
		textEndsWith("克").find().forEach(function(item) {
			let pos = item.bounds();
			if(pos.centerX() < 0 || pos.centerY() < 0)
				return false;
			else
			{
				click(pos.centerX(), pos.centerY());
				sleep(delay);
			}
		});
	}
}

/**
 * 帮助好友收取能量
 * @param {*} delay 点击能量球的时间间隔
 */
function help_friends_collection(delay)
{
    if(typeof(delay) == "undefined") delay = 0;
    var x_beg = 200, x_end = 900;
    var y_beg = 600, y_end = 700;
    for(var x = x_beg; x < x_end; x += 50)
        for(var y = y_beg; y < y_end; y += 50)
        {
            //遇到帮收失败则返回
            if(!click(x, y)) return false;
            sleep(delay);
        }
}

/**
 * 获取截图
 */
function get_captureimg()
{
    var img = captureScreen();
    sleep(100);
    if(img == null || typeof(img) == "undefined")
    {
        toast("截图失败，脚本退出");
        console.error("截图失败，脚本退出");
        exit();
    }
    else
    {
        return img;
    }
}
/**
 * 查找有能量成熟的好友
 */
function get_has_energy_friends()
{
    var img = get_captureimg();
    var hand = null, heart = null;

    //查找可收取能量的小手
    //"#ffffff"为白色， "#1da06d"为深绿色
    hand = images.findMultiColors(img, "#ffffff", [[0, -35, "#1da06d"], [0, 23, "#1da06d"]], {
        region: [1073, 400 , 1, 1800]
    });

    if(hand != null)
    {
        console.info("找到**可收取**好友");
        return [hand, "hand"];
    }
    if(g_help_friend == true)
    {
        //查找可帮收能量的爱心
        //"##f99236"为橙色， "#fffffb"和"#fffefb"为白色
        heart = images.findMultiColors(img, "#f99236", [[0, -10, "#fffffb"], [0, 15, "#fffefb"]], {
            region: [1059, 400 , 1, 1800]
        });

        if(heart != null)
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
function arrive_bottom()
{
    var img = get_captureimg();
    //分别是白色、浅灰色、深灰色
    var p = null;
    p = images.findMultiColors(img, "#F5F5F5", [[0, -40, "#FFFFFF"], [0, 20, "#999999"]], {
        region : [600, 2000],
        threshold : 0.9
    });
    if(p != null)
        return true;
    else
        return false;
}

/**
 * 进入好友排行榜
 */
function entrance_friends()
{
    var i = 0;
    sleep(500);
    var epoint = get_has_energy_friends();

    //确保当前操作是在排行榜界面
    //不断滑动，查找好友
    while(epoint == null)
    {
        swipe(520, 1800, 520, 800, 500);
        sleep(500);
        epoint = get_has_energy_friends();
        i++;
        //如果检测到结尾，同时也没有可收能量的好友，那么结束收取
        if(epoint == null && arrive_bottom())
        {
            toastLog("没有更多好友了");
            return true;
        }
        //如果连续32次都未检测到可收集好友,无论如何停止查找
        if(i >= 32)
        {
            console.error("程序可能出错, 连续" + i + "次未检测到可收集好友");
            return false;
        }
    }
    //找到好友，进入好友森林
    if(click(epoint[0].x, epoint[0].y))
    {
        //确认进入了好友森林
		let i = 0;
        while(i++ < 10)
        {
            if(text("浇水").exists() && text("弹幕").exists()) break;
            sleep(500);
        } 
        if(i < 10)
        {
            if(DEBUG) console.log("成功进入好友森林主页", "用时" + i*0.5 + "秒");
            if(epoint[1] == "hand")
                collection_energy(500);//default 500ms
            else
                help_friends_collection(0);//default 0ms
        }
        //返回排行榜
        back();
    }
    //递归调用
    entrance_friends();
}
/**
 * 运行结束
 */
function run_done(cnt)
{
    console.info("第 " + cnt + " 遍收集结束");
    back();
}
/**
 * 异常退出当前脚本前再启动一个脚本进行重试
 * @param {*} delay 退出前的时延
 */
function try_again(delay)
{
    console.error("脚本异常退出，即将重试");

    if(typeof(delay) == "undefined") delay = 1000; //default 1000ms
    let path = engines.myEngine().cwd();
    let name = "ant_forest.js";

    engines.execScriptFile(path + "/" + name);

    sleep(delay);

    //恢复亮度
    if(mode != -1)
    {
        device.setBrightnessMode(mode);
        device.setBrightness(light);
    }

    exit();
}
/**
 * 检查是否仍在给定时间范围内
 */
function check_time()
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
function print_configure_info()
{
    console.log("*********************************");
    if(g_is_cycle)
    {
        console.info("循环执行开始时间：" + g_startTime);
        console.info("循环执行结束时间：" + g_endTime);
    }
    let yes_or_no = g_help_friend ? "是":"否";
    console.info("是否帮助好友收取：" + yes_or_no);
    yes_or_no = g_low_power ? "是":"否";
    console.info("循环期间是否省电：" + yes_or_no);
    console.log("*********************************");
}

/**
 * 主函数
 */
function main()
{
    var unlock = require("./Modules/MODULE_UNLOCK");
    //解锁设备
    if(!unlock.unlock(g_password)) exit();
    sleep(1000);
    //获取截图权限
    get_screencapture_permission();
    //注册"音量下键按下退出脚本"事件
    var exit_event = register_exit_event();
    //等待退出事件子线程执行
    exit_event.waitFor();
    //输出配置信息
    print_configure_info();
    //检查是否开启省电运行
    if(g_is_cycle && g_low_power && check_time())
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
        open_alipay();
        //进入蚂蚁森林
        entrance_antforest();
        //一次收集结束
        run_done(cnt++);
    }while(g_is_cycle && check_time())
    //输出能量收集总量
    if(pre_energy != -1 && aft_energy != -1)
    {
        console.log("*********************************");
        console.info("本次运行共收集能量：" + (aft_energy - pre_energy) + "克");
        console.log("*********************************");
    }
    //恢复亮度
    if(mode != -1)
    {
        device.setBrightnessMode(mode);
        device.setBrightness(light);
    }
    //退出脚本
    toastLog("运行结束，退出脚本");
    exit();
}
