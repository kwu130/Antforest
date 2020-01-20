//0-9坐标映射表
var pas_table = [[550, 1800], [250, 1200], [550, 1200], 
[850, 1200], [250, 1400], [550, 1400], 
[850, 1400], [250, 1600], [550, 1600], 
[850, 1600]];

const WIDTH = Math.min(device.width, device.height);
const HEIGHT = Math.max(device.width, device.height);

module.exports = 
{
    unlock : function(password)
        {
            let i;
            //尝试唤醒屏幕
            i = 0;
            while(!device.isScreenOn() && i++ < 10)
            {
                //唤醒屏幕
                device.wakeUp();
                sleep(500);          
            }
            if(i >= 10)
            {
                console.error("唤醒屏幕失败，退出脚本");
                return false;
            }    
            else
            {
                console.info("该设备为：" + device.brand + " " + device.model);
                if(is_locked())
                {
                    //滑出解锁界面
                    if(device.brand === 'Xiaomi')
                    {//由于MIUI的解锁有变速检测，因此要点开时间以进入密码界面
                        //滑出状态栏
                        swipe(WIDTH / 2, 0, WIDTH / 2, HEIGHT, 500);
                        //点击时间位置
                        click(200, 200);
                    }
                    else
                    {
                        swipe(WIDTH / 2, HEIGHT / 2, WIDTH / 2, 0, 500);
                    }
                    sleep(1000);
                    //尝试解锁
                    i = 0;
                    while(is_locked() && i++ < 5)
                    {
                        try_password(password);
                        sleep(1000);
                    }
                    if(i >= 5)
                    {
                        console.log("解锁失败，退出脚本");
                        return false;
                    }
                    else
                    {
                        toastLog("解锁成功");
                        //返回主界面
                        home();
                        return true;
                    }
                }
                return true;      
            }
        }
};

/**
 * 判断设备是否解锁
 */
function is_locked()
{
    var keyguard_manager = context.getSystemService(context.KEYGUARD_SERVICE);
    var result = keyguard_manager.isKeyguardLocked();
    return result;
}

/**
 * 模拟解锁
 * @param {*} pasword 锁屏密码
 */
function try_password(pasword)
{
    for(let i = 0; i < pasword.length; i++)
    {
        click(pas_table[pasword[i]][0], pas_table[pasword[i]][1]);
        sleep(500);
    }
}