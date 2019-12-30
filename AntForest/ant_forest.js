//检查是否开启无障碍服务，若未开启则等待开启
auto.waitFor();

//测试机像素为1080*2340
//不要修改该行代码
setScreenMetrics(1080, 2340);
//不同像素的机型会对应缩放

//读取配置文件，设置相应参数
var config = storages.create("ant_forest_config");

var g_startTime   = config.get('start_time', "7:00");
var g_endTime     = config.get('end_time', "7:40");
var g_password    = config.get('password', "0514");
var g_is_cycle    = config.get('is_cycle', "false");
var g_help_friend = config.get('help_friend', "false");

//主程序入口
main();

/**
 * 请求截图权限
 */
function get_screencapture_permission()
{//建议永久开启截图权限，在"取消"按键的上方，部分设备看不见，但是是存在的可以点击
    if(!requestScreenCapture())
    {
        toastLog("获取截图权限失败，脚本退出");
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
            toastLog("音量下键被按下，脚本退出");
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
        toastLog("寻找支付宝首页失败，脚本退出");
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
        click_by_name("首页");
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

    if(!textEndsWith("蚂蚁森林").exists() && !descEndsWith("蚂蚁森林").exists())
    {
        toastLog("首页上没有蚂蚁森林，退出脚本");
        exit();
    }
    else
    {
        //进入蚂蚁森林主页
        toastLog("进入蚂蚁森林主页");
        click_by_name("蚂蚁森林");
        sleep(3000);
    }
    /*开始能量收集*/
    //收集自己的能量
    click_by_name("克");
    toastLog("自己能量收集完成");

    //模拟向上滑动以找到"查看更多好友"
    swipe(520, 1800, 520, 300, 500);
    sleep(500);
    swipe(520, 1800, 520, 300, 500);

    //进入能量排行榜
    console.log("点击查看更多好友");
    click_by_name("查看更多好友");
    sleep(1000);
    //进入好友排行榜页面
    entrance_friends();
}
/**
 * 根据传入参数点击 
 * @param {*} click_name 要点击的文本
 */
function click_by_name(click_name)
{
    var clicked = false;
    if(textEndsWith(click_name).exists())
    {
        textEndsWith(click_name).find().forEach(function(item){
            var pos = item.bounds();
            if(pos.centerX() < 0 || pos.centerY() < 0)
            {
                return false;
            }
            else
            {
                click(pos.centerX(), pos.centerY());
                clicked = true;
            } 
            sleep(500);
        });
    }
    else if(descEndsWith(click_name).exists() && clicked == false)
    {
        descEndsWith(click_name).find().forEach(function(item){
            var pos = item.bounds();
            if(pos.centerX() < 0 || pos.centerY() < 0)
            {
                return false;
            }
            else
            {
                click(pos.centerX(), pos.centerY());
                clicked = true;
            } 
            sleep(500);
        });
    }
    return clicked;
}
/**
 * 帮助好友收取能量
 */
function help_friends_collection()
{
    var x_beg = 200, x_end = 900;
    var y_beg = 600, y_end = 700;
    for(var x = x_beg; x < x_end; x += 50)
        for(var y = y_beg; y < y_end; y += 50)
        {
            //遇到帮收失败则返回
            if(!click(x, y)) return false;
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
        toastLog("截图失败，脚本退出");
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
        console.log("找到可收取能量好友");
        return [hand, "hand"];
    }
    if(g_help_friend)
    {
        //查找可帮收能量的爱心
        //"##f99236"为橙色， "#fffffb"和"#fffefb"为白色
        heart = images.findMultiColors(img, "#f99236", [[0, -10, "#fffffb"], [0, 15, "#fffefb"]], {
            region: [1059, 400 , 1, 1800]
        });

        if(heart != null)
        {
            console.log("找到可帮收能量好友");
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
            toastLog("程序可能出错, 连续" + i + "次未检测到可收集好友");
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
                click_by_name("克");
            else
                help_friends_collection();
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
        console.log("时间仍在监控范围内");
        return true;
    }
    else
    {
        console.log("时间不在监控范围内");
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
        console.log("循环执行开始时间：" + g_startTime);
        console.log("循环执行结束时间：" + g_endTime);
    }
    let help_friend = g_help_friend ? "是":"否";
    console.log("是否帮助好友收取：" + help_friend)
    console.log("-----------------------------------------"); 
}
/**
 * 主函数
 */
function main()
{
    // var unlock = require("./Modules/MODULE_UNLOCK");
    // //解锁设备
    // if(!unlock.unlock(g_password))
    // {
    //     exit();
    // }
    // sleep(1000);
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
    exit();
}
