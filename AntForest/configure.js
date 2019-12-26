"ui";

var config = storages.create("ant_forest_config");
/**
 * 设置默认配置
 */
function set_default_config(){
    var default_conf = {
        password: "",
        help_friend: false,
        is_cycle: false,
        start_time: "7:00",
        end_time: "7:30"
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
                </vertical>
                <horizontal w="*" h="1sp" bg="#cccccc" margin="10 0"></horizontal>
                <vertical w="*" gravity="left" layout_gravity="left" margin="10">
                    <text text="帮好友收取：" textColor="#666666" textSize="14sp" />
                    <radiogroup id="is_help_fris" orientation="horizontal" margin="0 10">
                        <radio text="是" checked="{{config.get('help_friend')}}" />
                        <radio text="否" checked="{{!config.get('help_friend')}}" marginLeft="20" />
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
        return val.toString();//结合 Function.toString()的方法来执行特定函数:
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

    //保存配置
    ui.save.on("click", () =>{
        let flag = false;
        if(config.get('is_cycle'))
        {
            let shour = Number(ui.picker_stime.getCurrentHour());
            let sminu = Number(ui.picker_stime.getCurrentMinute());

            let ehour = Number(ui.picker_etime.getCurrentHour());
            let eminu = Number(ui.picker_etime.getCurrentMinute());

            if(shour*60 + sminu >= ehour*60 + eminu)
                toastLog("结束时间小于开始时间，请重新选择");
            else
            {
                update("start_time", format(shour)+":"+format(sminu));
                update("end_time", format(ehour)+":"+format(eminu));
                flag = true;
            }  
        }
        update("password", format(ui.password.getText()));
        if(config.get('is_cycle'))
        {
            if(flag)
                toastLog("保存成功");
        }
        else
        {
            toastLog("保存成功");
        }        
    });
    //清除本地储存
    ui.clear.on("click", () => {
        confirm("确定要清除配置？").then(ok => {
                if (ok) {
                    storages.remove("ant_forest_config");
                    toastLog("清除成功");
                }
            });
    });
}

draw_view();
