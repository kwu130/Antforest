// //var enger_num = item.desc().toString();
// var enger_num = "收集能量12克";
// log(enger_num.substring(4, enger_num.length-1));
var t = new Object();
t.sum = 0;
function f(num) {
    let enger_num = "收集能量"+num+"克";
    t.sum += Number(enger_num.substring(4, enger_num.length-1));
}

f("12");
f("1");
f("7");
log(t);



