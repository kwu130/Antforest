//检查是否开启无障碍服务，若未开启则等待开启
auto.waitFor();

//测试机像素为1080*2340
//不要修改该行代码
setScreenMetrics(1080, 2340);
//不同像素的机型会对应缩放

//设置循环收取能量的时间范围
var g_startTime = "7:00";
var g_endTime = "7:40";
//默认关闭循环运行
var g_is_loop = false;
//锁屏密码
var g_password = "0514";
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
    console.log("获取截图权限成功，等待支付宝启动");
    sleep(2000);
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
    toastLog("等待支付宝启动");
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
    swipe(520,1200,520,600,500);
    sleep(500);
    swipe(520,600,520,1200,500);

    if(!textEndsWith("蚂蚁森林").exists() && !descEndsWith("蚂蚁森林").exists())
    {
        toastLog("首页上没有蚂蚁森林，退出脚本");
        exit();
    }
    else
    {
        click_by_name("蚂蚁森林");
        sleep(1000);
    }
    //进入蚂蚁森林主页
    console.log("进入蚂蚁森林主页");
    /*开始能量收集*/
    sleep(1000);

    //收集自己的能量
    click_by_name("克");
    toastLog("自己能量收集完成");
    sleep(1000);

    //模拟向上滑动以找到"查看更多好友"
    swipe(520,1800,520,300,500);
    sleep(500);
    swipe(520,1800,520,300,500);

    //进入能量排行榜
    toastLog("点击查看更多好友");
    sleep(1000);
    click_by_name("查看更多好友");
    //进入好友排行榜页面
    entrance_friends();
}
/**
 * 根据传入参数点击 
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
    if(descEndsWith(click_name).exists() && clicked == false)
    {
        descEndsWith(click_name).find().forEach(function(item){
            var pos = item.bounds();
            log(pos);
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
    var p = null;
    //区分倒计时和可收取能量的小手
    //"#ffffff"为白色， "#1da06d"为深绿色
    p = images.findMultiColors(img, "#ffffff", [[0, -35, "#1da06d"], [0, 23, "#1da06d"]], {
        region: [1073, 400 , 1, 1800]
    });
    if(p != null)
    {
        toastLog("找到好友");
        return p;
    }
    else
    {
        return null;
    }
}
/**
 * 进入好友排行榜
 */
function entrance_friends()
{
    var i = 0;
    var epoint = get_has_energy_friends();

    //确保当前操作是在排行榜界面
    //不断滑动，查找好友
    while(epoint == null)
    {
        swipe(520,1800,520,800,500);
        sleep(500);
        epoint = get_has_energy_friends();
        i++;
        //如果检测到结尾，同时也没有可收能量的好友，那么结束收取
        //支付宝更新后"没有更多了"不能查找到，因此该if永远不会满足，但不影响程序运行，
        //等待后续改进
        if(textEndsWith("没有更多了").exists() || descEndsWith("没有更多了").exists())
        {
            if(epoint == null)
            {
                return true;
            }
        }
        //如果连续32次都未检测到可收集好友,无论如何停止查找
        if(i >= 32)
        {
            //toastLog("程序可能出错, 连续" + i + "次未检测到可收集好友");
            toastLog("所有好友能量收集完成");
            return false;
        }
    }
    //找到好友，进入好友森林
    click(epoint.x, epoint.y + 20);
    sleep(3000);
    //确认进入了好友森林
    if(textEndsWith("浇水").exists() && textEndsWith("弹幕").exists())
    {
        click_by_name("克");
    }
    //返回排行榜
    back();
    //递归调用
    entrance_friends();
}
/**
 * 运行结束
 */
function run_done()
{
    toastLog("一次运行结束");
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
        //暂停1分钟
        sleep(60 * 1000);
        return true;
    }
    else
    {
        console.log("时间不在监控范围内");
        return false;
    }
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
    sleep(3000);
    //获取截图权限
    get_screencapture_permission();
    //注册"音量下键按下退出脚本"事件
    var exit_event = register_exit_event();
    //等待退出事件子线程执行
    exit_event.waitFor();
    do
    {
        //打开支付宝
        open_alipay();
        //进入蚂蚁森林
        entrance_antforest();
        //运行结束
        run_done();
    }while(check_time() && g_is_loop)

    //退出脚本
    toastLog("退出脚本");
    exit();
}
