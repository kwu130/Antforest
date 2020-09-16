"ui";

var config = storages.create("ant_forest_config");
/**
 * 设置默认配置
 */
function set_default_config(){
    var default_conf = {
        password: "",
        passmode: "pin",
        help_friend: false,
        is_cycle: false,
        start_time: "7:00",
        end_time: "7:40",
        low_power: false,
        force_retry: false,
    };
    // 储存默认配置到本地
    Object.keys(default_conf).forEach(function (key) {
        config.put(key, default_conf[key]);
    });
}

//第一次配置参数
if (!config.contains("password")) {
    toastLog("使用默认配置");
    // 默认执行配置
    set_default_config();
}

/**
 * 画UI界面
 */
function draw_view() {
    ui.layout(
        <ScrollView>
            <vertical id="viewport">
                <frame>
                    <appbar>
                        <toolbar id="toolbar" title="执行配置" />
                    </appbar>
                </frame>
                <vertical w="*" gravity="left" layout_gravity="left" margin="10">
                    <text text="循环执行：" textColor="#666666" textSize="14sp" />
                    <radiogroup id="exec_pattern" orientation="horizontal" margin="0 10">
                        <radio text="是" checked="{{config.get('is_cycle')}}" />
                        <radio text="否" checked="{{!config.get('is_cycle')}}" marginLeft="20" />
                    </radiogroup>
                    <vertical visibility="{{config.get('is_cycle') ? 'visible' : 'gone'}}" w="*" gravity="left" layout_gravity="left">
                        <text text="循环时间范围：" textColor="#666666" textSize="14sp" />
                        <text text="开始时间(默认{{config.get('start_time')}})" textColor="#666666" textSize="12sp" marginTop="16" />
                        <timepicker id="picker_stime" timePickerMode="spinner"/>
                        <text text="结束时间(默认{{config.get('end_time')}})" textColor="#666666" textSize="12sp" marginTop="16" />
                        <timepicker id="picker_etime" timePickerMode="spinner"/>
                    </vertical>
                    <vertical visibility="{{config.get('is_cycle') ? 'visible' : 'gone'}}" w="*" gravity="left" layout_gravity="left">
                        <text text="循环期间省电运行：" textColor="#666666" textSize="14sp" />
                        <radiogroup id="save_power" orientation="horizontal" margin="0 10">
                            <radio text="是" checked="{{config.get('low_power')}}" />
                            <radio text="否" checked="{{!config.get('low_power')}}" marginLeft="20" />
                        </radiogroup>
                    </vertical>
                    <vertical visibility="{{config.get('is_cycle') ? 'visible' : 'gone'}}" w="*" gravity="left" layout_gravity="left">
                        <text text="循环期间强制重试：" textColor="#666666" textSize="14sp" />
                        <radiogroup id="force_retry" orientation="horizontal" margin="0 10">
                            <radio text="是" checked="{{config.get('force_retry')}}" />
                            <radio text="否" checked="{{!config.get('force_retry')}}" marginLeft="20" />
                        </radiogroup>
                    </vertical>
                </vertical>
                <horizontal w="*" h="1sp" bg="#cccccc" margin="10 0"></horizontal>
                <vertical w="*" gravity="left" layout_gravity="left" margin="10">
                    <text text="帮好友收取能量：" textColor="#666666" textSize="14sp" />
                    <radiogroup id="is_help_fris" orientation="horizontal" margin="0 10">
                        <radio text="是" checked="{{config.get('help_friend')}}" />
                        <radio text="否" checked="{{!config.get('help_friend')}}" marginLeft="20" />
                    </radiogroup>
                </vertical>
                <horizontal w="*" h="1sp" bg="#cccccc" margin="10 0"></horizontal>
                <vertical w="*" gravity="left" layout_gravity="left" margin="10">
                    <text text="解锁方式：" textColor="#666666" textSize="14sp" />
                    <radiogroup id="passmode" orientation="horizontal" margin="0 10">
                        <radio text="数字解锁" checked="{{config.get('passmode') == 'pin'}}" />
                        <radio text="图案解锁" checked="{{config.get('passmode') == 'gesture'}}" marginLeft="20" />
                    </radiogroup>
                </vertical>
                <horizontal w="*" h="1sp" bg="#cccccc" margin="10 0"></horizontal>
                <vertical w="*" gravity="left" layout_gravity="left" margin="10">
                    <text text="解锁密码：" textColor="#666666" textSize="14sp" />
                    <input id="password" inputType="textVisiblePassword" text="{{config.get('password')}}" />
                </vertical>
                <horizontal w="*" gravity="left" layout_gravity="center" margin="10">
                    <button w="500px" id="save" text="保存配置" />
                    <button w="500px" id="clear" text="清除配置"  />
                </horizontal>
            </vertical>
        </ScrollView>
    );

    //设置24小时制
    ui.picker_stime.setIs24HourView(true);
    ui.picker_etime.setIs24HourView(true);
    
    /**
     * 更新本地配置同时重绘UI
     * @param {*} new_key 键
     * @param {*} new_val 值
     */
    function update(new_key, new_val) {
        config.put(new_key, new_val);
        if (new_key == "is_cycle") draw_view();
    }

    // 格式化
    function format(val) {
        return val.toString();
    }

    // 更新选中的执行方法
    ui.exec_pattern.setOnCheckedChangeListener(function (radioGroup, id) {
        let index = (id + 1) % radioGroup.getChildCount();
        //toast(radioGroup.getChildAt(index).getText());
        if (radioGroup.getChildAt(index).getText() == "是") {
            update("is_cycle", true);
        } else {
            update("is_cycle", false);
        }
    });

    // 更新是否帮助好友
    ui.is_help_fris.setOnCheckedChangeListener(function (radioGroup, id) {
        let index = (id + 1) % radioGroup.getChildCount();
        //toast(radioGroup.getChildAt(index).getText());
        if (radioGroup.getChildAt(index).getText() == "是") {
            update("help_friend", true);
        } else {
            update("help_friend", false);
        }
    });

    //更新是否省电收集save_power
    ui.save_power.setOnCheckedChangeListener(function (radioGroup, id) {
        let index = (id + 1) % radioGroup.getChildCount();
        //toast(radioGroup.getChildAt(index).getText());
        if (radioGroup.getChildAt(index).getText() == "是") {
            update("low_power", true);
        } else {
            update("low_power", false);
        }
    });

    //更新是否强制重试
    //即在循环期间遇到解锁失败、找不到蚂蚁森林、进入蚂蚁森林失败
    //等情况下进行不断重试直至成功或超出循环执行时间范围
    ui.force_retry.setOnCheckedChangeListener(function (radioGroup, id) {
        let index = (id + 1) % radioGroup.getChildCount();
        //toast(radioGroup.getChildAt(index).getText());
        if (radioGroup.getChildAt(index).getText() == "是") {
            update("force_retry", true);
        } else {
            update("force_retry", false);
        }
    })

    //更新解锁方式
    ui.passmode.setOnCheckedChangeListener(function (radioGroup, id) {
        let index = (id + 1) % radioGroup.getChildCount();
        //toast(radioGroup.getChildAt(index).getText());
        if (radioGroup.getChildAt(index).getText() == "数字解锁") {
            update("passmode", "pin");
        } else {
            update("passmode", "gesture");
        }
    });

    //检查用户是否修改循环时间
    function check_time_modify(myclock)
    {
        var date = new Date();
        var hour = date.getHours();
        var minu = date.getMinutes();

        var myhour = myclock.getCurrentHour();
        var myminu = myclock.getCurrentMinute();

        if(myhour != hour || myminu != minu)
            return true;
        else
            return false;
    }

    //保存配置
    ui.save.on("click", () =>{
        if(config.get('is_cycle') && (check_time_modify(ui.picker_stime) || check_time_modify(ui.picker_etime)))
        {
            let shour = Number(ui.picker_stime.getCurrentHour());
            let sminu = Number(ui.picker_stime.getCurrentMinute());

            let ehour = Number(ui.picker_etime.getCurrentHour());
            let eminu = Number(ui.picker_etime.getCurrentMinute());

            if(shour*60 + sminu >= ehour*60 + eminu)
            {
                toast("结束时间小于开始时间，请重新选择");
                console.warn("结束时间小于开始时间，请重新选择");
                return false;
            }
            else
            {
                update("start_time", format(shour) + ":" + format(sminu));
                update("end_time", format(ehour) + ":" + format(eminu));
            }  
        }
        update("password", format(ui.password.getText()));
        toastLog("保存成功"); 

    });
    //清除本地储存
    ui.clear.on("click", () => {
        confirm("确定要清除配置？").then(ok => {
                if (ok) {
                    set_default_config();
                    toastLog("清除成功");
                    draw_view();
                }
            });
    });
}

draw_view();
