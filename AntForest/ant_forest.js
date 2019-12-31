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
//搜索控件时使用的常量
const PREFIX = "prefix";
const SUFFIX = "suffix";
const TEXT   = "text";
const DESC   = "desc";

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
    var i = 0;
    //尝试5次找到支付宝首页
    while(!textEndsWith("首页").exists() && !textEndsWith("我的").exists() && i < 5)
    {
        back();
        sleep(1000);
        i++;
    }
    if(i >= 5)
    {
        toast("寻找支付宝首页失败，脚本退出");
        console.error("寻找支付宝首页失败，脚本退出");
        sleep(2000);
        return false;
    }
    else   
        console.log("第" + i + "次寻找支付宝首页成功");
    return true;
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
        exit();
    }
    else
    {//找到则点击
        let res = click_by_name("首页", SUFFIX, TEXT, 1000);
        if(res == false)
        {
            console.error("打开支付宝首页失败，退出脚本");
            exit();
        }
    }
}
/**
 * 进入蚂蚁森林
 */
function entrance_antforest()
{
    //模拟刷新页面
    swipe(520, 200, 520, 1200, 500);
    sleep(500);
    swipe(520, 200, 520, 1200, 500);

    let res1 = click_by_name("蚂蚁森林", PREFIX, TEXT, 1000);
    if(res1 == null)
    {
        toast("首页上没有蚂蚁森林，退出脚本");
        console.error("首页上没有蚂蚁森林，退出脚本");
        exit();
    }
    else if(res1 == false)
    {
        toast("进入蚂蚁森林失败，退出脚本");
        console.error("进入蚂蚁森林失败, 退出脚本");
        exit();
    }
    else
    {
        //进入蚂蚁森林主页
        toastLog("进入蚂蚁森林主页");
        sleep(3000);
    }
    /*开始能量收集*/
    //收集自己的能量
    collection_energy(100);
    toast("自己能量收集完成");
    console.info("自己能量收集完成");

    //模拟向上滑动以找到"查看更多好友"
    swipe(520, 1800, 520, 300, 500);
    sleep(500);
    swipe(520, 1800, 520, 300, 500);

    //进入好友能量排行榜
    console.log("点击查看更多好友");
    let res2 = click_by_name("查看更多好友", PREFIX, TEXT, 1000);
    if(res2 == null)
    {
        toast("没有找到查看更多好友，退出脚本");
        console.error("没有找到查看更多好友，退出脚本");
        exit();
    }
    else if(res2 == false)
    {
        toast("进入好友排行榜失败，退出脚本");
        console.error("进入好友排行榜失败, 退出脚本");
        exit();
    }
    else
    {
        //进入好友排行榜
        console.log("进入好友排行榜");
        sleep(1000);
        //进入好友排行榜页面
        entrance_friends();
    }
}
/**
 * 根据名称点击控件
 * @param {*} click_name 控件名称
 * @param {*} prefix_or_suffix 前缀还是后缀
 * @param {*} text_or_desc text还是desc属性
 * @param {*} timeout 超时时间
 */
function click_by_name(click_name, prefix_or_suffix, text_or_desc, timeout)
{
    if(prefix_or_suffix == "prefix" && text_or_desc == "text")
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
    if(prefix_or_suffix == "prefix" && text_or_desc == "desc")
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
    if(prefix_or_suffix == "suffix" && text_or_desc == "text")
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
    if(prefix_or_suffix == "suffix" && text_or_desc == "desc")
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
}

/**
 * 收集自己和好友的能量
 * @param {*} delay 点击能量球的时间间隔
 */
function collection_energy(delay)
{//delay为500ms时，可直观观察到能量收集情况
    if(typeof(delay) == "undefined") delay = 500;
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
            toastLog("所有好友能量收集完成");
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
        sleep(2000);
        //确认进入了好友森林
        if(textEndsWith("浇水").exists() && textEndsWith("弹幕").exists())
        {
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
function run_done()
{
    console.log("一次运行结束");
    back();
    sleep(1000);
    back();
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
    console.log("-----------------------------------------"); 
    if(g_is_cycle)
    {
        console.info("循环执行开始时间：" + g_startTime);
        console.info("循环执行结束时间：" + g_endTime);
    }
    let yes_or_no = g_help_friend ? "是":"否";
    console.info("是否帮助好友收取：" + yes_or_no)
    console.log("-----------------------------------------"); 
}

/**
 * 主函数
 */
function main()
{
    var unlock = require("./Modules/MODULE_UNLOCK");
    //解锁设备
    if(!unlock.unlock(g_password))
    {
        exit();
    }
    sleep(1000);
    //获取截图权限
    get_screencapture_permission();
    //注册"音量下键按下退出脚本"事件
    var exit_event = register_exit_event();
    //等待退出事件子线程执行
    exit_event.waitFor();
    //输出配置信息
    print_configure_info();
    do
    {
        //打开支付宝
        open_alipay();
        //进入蚂蚁森林
        entrance_antforest();
        //运行结束
        run_done();
    }while(g_is_cycle && check_time())

    //退出脚本
    toastLog("退出脚本");
    exit();con
}
