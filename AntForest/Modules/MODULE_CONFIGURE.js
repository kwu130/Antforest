var config = storages.create("ant_forest_config");
module.exports = 
{
    startTime   : config.get('start_time', "7:00"),
    endTime     : config.get('end_time', "7:40"),
    password    : config.get('password', "0514"),
    passmode    : config.get('passmode', "pin"),
    is_cycle    : config.get('is_cycle', "false"),
    help_friend : config.get('help_friend', "false"),
    low_power   : config.get('low_power', "false"),
    force_retry : config.get('force_retry', "false"),
}
